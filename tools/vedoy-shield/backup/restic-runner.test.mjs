/**
 * Integration tests: real Restic encryption + full restore/hash verification.
 * Only ephemeral local repositories are used. No user data, no production keys.
 * Run: node --test tools/vedoy-shield/backup/restic-runner.test.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, symlinkSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const runner = fileURLToPath(new URL("./restic-runner.mjs", import.meta.url));
const restic = spawnSync("restic", ["version"], { encoding: "utf8" });
const resticInstalled = restic.status === 0;
const hash = (buffer) => createHash("sha256").update(buffer).digest("hex");
const invoke = (args, env) => spawnSync(process.execPath, [runner, ...args], {
  env, encoding: "utf8", timeout: 120000,
});

test("real Restic encrypted backup -> full restore -> SHA-256 comparison; originals retained", { skip: !resticInstalled }, () => {
  const base = mkdtempSync(path.join(os.tmpdir(), "vedoy-shield-restic-ci-"));
  try {
    const source = path.join(base, "dataset");
    const state = path.join(base, "state");
    const repo = path.join(base, "offhost-test-repo");
    const key = path.join(base, "secrets", "restic-passphrase");
    mkdirSync(path.join(source, "tenant-a"), { recursive: true });
    mkdirSync(path.join(source, "tenant-b"), { recursive: true });
    mkdirSync(path.dirname(key), { recursive: true, mode: 0o700 });
    mkdirSync(state, { mode: 0o700 });
    const alice = Buffer.from("alice-private-" + "a".repeat(1500));
    const bob = Buffer.from("bob-private-" + "b".repeat(900));
    writeFileSync(path.join(source, "tenant-a", "private.txt"), alice);
    writeFileSync(path.join(source, "tenant-b", "private.txt"), bob);
    writeFileSync(key, "test-only-" + "9".repeat(52), { mode: 0o600 });

    const env = { ...process.env, RESTIC_REPOSITORY: repo, RESTIC_PASSWORD_FILE: key,
      SHIELD_BACKUP_ALLOW_LOCAL: "1", SHIELD_BACKUP_ALLOW_INIT: "1",
      SHIELD_BACKUP_STATE_DIR: state };

    let result = invoke(["init", "--state", state], env);
    assert.equal(result.status, 0, result.stderr);
    result = invoke(["backup", "--source", source, "--state", state], env);
    assert.equal(result.status, 0, result.stderr);
    const saved = JSON.parse(result.stdout.trim());
    assert.equal(saved.verified, true);
    assert.equal(saved.deletedOriginals, false);
    assert.match(saved.snapshot, /^[0-9a-f]{64}$/);
    assert.equal(readFileSync(path.join(source, "tenant-a", "private.txt")).toString(), alice.toString());
    assert.equal(readFileSync(path.join(source, "tenant-b", "private.txt")).toString(), bob.toString());

    const report = JSON.parse(readFileSync(path.join(state, saved.snapshot + ".json"), "utf8"));
    assert.equal(report.verified, true);
    assert.equal(report.files.length, 2);
    assert.equal(report.files.find(f => f.path === "tenant-a/private.txt")?.sha256, hash(alice));

    result = invoke(["verify", "--state", state, "--snapshot", saved.snapshot], env);
    assert.equal(result.status, 0, result.stderr);
    const target = path.join(base, "disaster-recovery");
    result = invoke(["restore", "--state", state, "--snapshot", saved.snapshot, "--target", target], env);
    assert.equal(result.status, 0, result.stderr);
    const restored = JSON.parse(result.stdout.trim());
    assert.equal(restored.verified, true);
    assert.equal(hash(readFileSync(path.join(restored.restoredRoot, "tenant-a", "private.txt"))), hash(alice));
    assert.equal(hash(readFileSync(path.join(restored.restoredRoot, "tenant-b", "private.txt"))), hash(bob));

    // Never overwrite an existing recovery path.
    result = invoke(["restore", "--state", state, "--snapshot", saved.snapshot, "--target", target], env);
    assert.notEqual(result.status, 0);

    // Tampering with local audit evidence must block repeat verification.
    const damaged = { ...report, files: report.files.map(f => f.path.startsWith("tenant-a/")
      ? { ...f, sha256: "0".repeat(64) } : f) };
    writeFileSync(path.join(state, saved.snapshot + ".json"), JSON.stringify(damaged), { mode: 0o600 });
    result = invoke(["verify", "--state", state, "--snapshot", saved.snapshot], env);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /differ from the saved SHA-256 manifest/);
  } finally { rmSync(base, { recursive: true, force: true }); }
});

test("refuse symlink sources, weak password permissions, and network-free local production backups", () => {
  const base = mkdtempSync(path.join(os.tmpdir(), "vedoy-shield-invalid-"));
  try {
    const source = path.join(base, "source");
    const key = path.join(base, "secret");
    const state = path.join(base, "state");
    mkdirSync(source); mkdirSync(state, { mode: 0o700 });
    writeFileSync(path.join(source, "data"), "keep");
    writeFileSync(key, "secret", { mode: 0o644 });
    let env = { ...process.env, RESTIC_REPOSITORY: path.join(base, "repo"),
      RESTIC_PASSWORD_FILE: key, SHIELD_BACKUP_ALLOW_LOCAL: "1" };
    let result = invoke(["backup", "--source", source, "--state", state], env);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /0600/);
    rmSync(key);
    writeFileSync(key, "secret", { mode: 0o600 });
    env = { ...env, SHIELD_BACKUP_ALLOW_LOCAL: "0" };
    result = invoke(["backup", "--source", source, "--state", state], env);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /off-host/);
    env = { ...env, SHIELD_BACKUP_ALLOW_LOCAL: "1" };
    symlinkSync(path.join(source, "data"), path.join(source, "unsafe-link"));
    result = invoke(["backup", "--source", source, "--state", state], env);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /symlinks/);
  } finally { rmSync(base, { recursive: true, force: true }); }
});
