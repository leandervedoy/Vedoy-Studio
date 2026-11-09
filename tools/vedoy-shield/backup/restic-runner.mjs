#!/usr/bin/env node
/**
 * Vedoy Shield -> Restic backup controller.
 * Server-side only: no user-facing credentials, no homegrown cryptography,
 * no source deletion, no prune/forget, no hidden automatic restore.
 *
 * Node >= 20. Requires an independently installed and verified Restic binary.
 */
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import {
  chmod, lstat, mkdir, mkdtemp, open, readFile, readdir, realpath,
  rm, stat, writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const SHA = /^[a-f0-9]{64}$/;
const TOOL = process.env.SHIELD_RESTIC_BINARY || "restic";

function argumentsForCommand(argv) {
  const [command, ...args] = argv;
  if (!["init", "backup", "verify", "restore", "status"].includes(command)) {
    throw Error("Use init, backup, verify, restore, or status.");
  }
  const flags = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!args[i]?.startsWith("--") || !args[i + 1] || args[i + 1].startsWith("--")) {
      throw Error("Expected --source, --state, --snapshot or --target with a value.");
    }
    const name = args[i].slice(2);
    if (!["source", "state", "snapshot", "target"].includes(name) || name in flags) {
      throw Error("Unknown or duplicate command argument.");
    }
    flags[name] = args[i + 1];
  }
  return { command, flags };
}

function requireAbsolute(value, label) {
  if (!value || !path.isAbsolute(value)) throw Error(label + " must be an absolute path.");
  const normalized = path.resolve(value);
  if (normalized === path.parse(normalized).root) throw Error(label + " cannot be filesystem root.");
  return normalized;
}

function within(child, parent) {
  const rel = path.relative(parent, child);
  return rel === "" || (!rel.startsWith(".." + path.sep) && rel !== ".." && !path.isAbsolute(rel));
}

async function config(flags, command) {
  const repo = process.env.RESTIC_REPOSITORY;
  if (!repo || /\s/.test(repo) || repo.length > 500) throw Error("RESTIC_REPOSITORY is missing or malformed.");
  if (!/^(sftp:|s3:|rest:https:\/\/|b2:|azure:|gs:)/.test(repo) && process.env.SHIELD_BACKUP_ALLOW_LOCAL !== "1") {
    throw Error("Production backup repositories must be off-host. Local use requires explicit test opt-in.");
  }
  if (process.env.RESTIC_PASSWORD) throw Error("Use RESTIC_PASSWORD_FILE, never RESTIC_PASSWORD.");
  const key = requireAbsolute(process.env.RESTIC_PASSWORD_FILE, "RESTIC_PASSWORD_FILE");
  const keyMeta = await stat(key);
  if (!keyMeta.isFile() || (keyMeta.mode & 0o077) !== 0) throw Error("Restic secret must be a regular file with mode 0600 or stricter.");
  const state = requireAbsolute(flags.state || process.env.SHIELD_BACKUP_STATE_DIR, "Backup state directory");
  await mkdir(state, { recursive: true, mode: 0o700 });
  const statePath = await realpath(state);
  const stateMeta = await stat(statePath);
  if ((stateMeta.mode & 0o077) !== 0) throw Error("Backup state directory must have mode 0700 or stricter.");
  if (within(key, statePath)) throw Error("Backup secret must be stored separately from local reports.");
  let source = null;
  if (command === "backup") {
    source = requireAbsolute(flags.source || process.env.SHIELD_BACKUP_SOURCE, "Backup source");
    const sourceMeta = await lstat(source);
    if (!sourceMeta.isDirectory() || sourceMeta.isSymbolicLink()) throw Error("Backup source must be a real directory.");
    source = await realpath(source);
    if (within(source, statePath) || within(statePath, source) || within(key, source)) {
      throw Error("Data, reports and Restic password file must not overlap.");
    }
  }
  return { repo, key, state: statePath, source };
}

function restic(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(TOOL, args, {
      env: process.env, shell: false, stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "", stderrBytes = 0;
    child.stdout.on("data", chunk => {
      stdout += chunk.toString("utf8");
      if (stdout.length > 4 * 1024 * 1024) child.kill("SIGKILL");
    });
    child.stderr.on("data", chunk => {
      stderrBytes += chunk.length;
      if (stderrBytes > 4 * 1024 * 1024) child.kill("SIGKILL");
    });
    child.on("error", () => reject(Error("Restic is not available. Check installed binary.")));
    child.on("close", (code, signal) =>
      code === 0 ? resolve(stdout) : reject(Error("Restic operation failed (exit " + String(code ?? signal) + "). Check protected server logs.")));
  });
}

function sha256File(filename) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filename);
    stream.on("data", bytes => hash.update(bytes));
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

async function manifest(root) {
  const output = [];
  async function visit(dir, prefix) {
    const contents = await readdir(dir, { withFileTypes: true });
    contents.sort((a, b) => a.name.localeCompare(b.name));
    for (const item of contents) {
      const relative = prefix ? prefix + "/" + item.name : item.name;
      const full = path.join(dir, item.name);
      const info = await lstat(full);
      if (info.isSymbolicLink() || (!info.isDirectory() && !info.isFile())) {
        throw Error("Unsupported file type in backup dataset: symlinks and device files are forbidden.");
      }
      if (info.isDirectory()) await visit(full, relative);
      else output.push({ path: relative, bytes: info.size, sha256: await sha256File(full) });
    }
  }
  await visit(root, "");
  return output;
}

function compare(expected, actual) {
  const left = [...expected].sort((a, b) => a.path.localeCompare(b.path));
  const right = [...actual].sort((a, b) => a.path.localeCompare(b.path));
  if (JSON.stringify(left) !== JSON.stringify(right)) throw Error("Restored files differ from the saved SHA-256 manifest.");
}

function restoredPath(target, source) {
  return path.join(target, path.relative(path.parse(source).root, source));
}

async function verifySnapshot(id, source, files, check = true) {
  if (!SHA.test(id)) throw Error("Snapshot ID is invalid.");
  if (check) await restic(["check", "--read-data"]);
  const tmp = await mkdtemp(path.join(os.tmpdir(), "shield-restic-restore-"));
  try {
    await restic(["restore", id, "--target", tmp]);
    const restored = restoredPath(tmp, source);
    compare(files, await manifest(restored));
    return { verified: true, fileCount: files.length };
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}

async function saveReport(state, id, data) {
  const filename = path.join(state, id + ".json");
  const tmp = filename + "." + process.pid + ".tmp";
  await writeFile(tmp, JSON.stringify(data, null, 2) + "\n", { encoding: "utf8", mode: 0o600, flag: "wx" });
  await chmod(tmp, 0o600);
  const fs = await open(tmp, "r");
  try { await fs.sync(); } finally { await fs.close(); }
  // Rename atomically for this local state filesystem. No backup source is altered.
  const { rename } = await import("node:fs/promises");
  await rename(tmp, filename);
}

async function loadReport(state, id) {
  if (!SHA.test(id)) throw Error("Snapshot ID is invalid.");
  const file = path.join(state, id + ".json");
  const raw = JSON.parse(await readFile(file, "utf8"));
  if (raw.version !== 1 || raw.snapshot !== id ||
      typeof raw.source !== "string" || !path.isAbsolute(raw.source) ||
      !Array.isArray(raw.files) || raw.files.length > 1000000 ||
      !raw.files.every(f => typeof f.path === "string" && f.path &&
        !f.path.startsWith("/") && !f.path.split("/").includes("..") &&
        Number.isSafeInteger(f.bytes) && f.bytes >= 0 && SHA.test(f.sha256))) {
    throw Error("Backup report is corrupt or unsupported.");
  }
  return raw;
}

async function main() {
  const { command, flags } = argumentsForCommand(process.argv.slice(2));
  const cfg = await config(flags, command);
  if (command === "init") {
    if (process.env.SHIELD_BACKUP_ALLOW_INIT !== "1") throw Error("Repository init requires explicit SHIELD_BACKUP_ALLOW_INIT=1.");
    await restic(["init"]);
    console.log(JSON.stringify({ operation: "init", initialized: true }));
    return;
  }
  if (command === "backup") {
    const files = await manifest(cfg.source);
    if (!files.length) throw Error("Refusing to back up an empty dataset.");
    const lines = (await restic(["backup", "--json", "--tag", "vedoy-shield", cfg.source]))
      .split("\n").map(line => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean);
    const summary = lines.findLast(row => row.message_type === "summary");
    if (!summary || !SHA.test(summary.snapshot_id || "")) throw Error("Restic did not return an unambiguous snapshot ID.");
    const snapshot = summary.snapshot_id;
    const report = { version: 1, snapshot, source: cfg.source, files, verified: false, timestamp: new Date().toISOString(), backend: "restic" };
    await saveReport(cfg.state, snapshot, report);
    // Fail closed: do not mark verified unless a full repository check and
    // an actual restore into isolated temporary storage match every SHA-256.
    await verifySnapshot(snapshot, cfg.source, files);
    compare(files, await manifest(cfg.source)); // detect mutations during backup
    report.verified = true;
    report.verifiedAt = new Date().toISOString();
    await saveReport(cfg.state, snapshot, report);
    console.log(JSON.stringify({ operation: "backup", snapshot, verified: true, files: files.length, deletedOriginals: false }));
    return;
  }
  const id = flags.snapshot;
  const report = await loadReport(cfg.state, id);
  if (command === "status") {
    console.log(JSON.stringify({ operation: "status", snapshot: id, verified: report.verified, verifiedAt: report.verifiedAt || null }));
    return;
  }
  if (command === "verify") {
    await verifySnapshot(id, report.source, report.files);
    report.verified = true;
    report.verifiedAt = new Date().toISOString();
    await saveReport(cfg.state, id, report);
    console.log(JSON.stringify({ operation: "verify", snapshot: id, verified: true }));
    return;
  }
  if (command === "restore") {
    const target = requireAbsolute(flags.target, "Restore target");
    if (within(target, cfg.state) || within(cfg.state, target)) throw Error("Restore target must be separate from backup state.");
    try { await lstat(target); throw Error("Restore target must not exist; overwrites are forbidden."); }
    catch (e) { if (e?.code !== "ENOENT") throw e; }
    await mkdir(target, { mode: 0o700 });
    await restic(["restore", id, "--target", target]);
    const root = restoredPath(target, report.source);
    compare(report.files, await manifest(root));
    console.log(JSON.stringify({ operation: "restore", snapshot: id, verified: true, restoredRoot: root, deletedOriginals: false }));
  }
}

main().catch(error => {
  // No user-owned paths, passwords or backend URL are echoed to stdout/stderr.
  console.error("[Vedoy Shield backup] " + error.message);
  process.exitCode = 1;
});
