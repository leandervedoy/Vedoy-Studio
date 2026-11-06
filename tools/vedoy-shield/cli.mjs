#!/usr/bin/env node
import { LIBRARIES, PROFILES } from "./catalog.mjs";
import { createPlan, installCommand, loadTarget, runInstall } from "./installer.mjs";
import { spawnSync } from "node:child_process";

const usage = `Vedoy Shield / dependency toolkit

Commands:
  node tools/vedoy-shield/cli.mjs list [--json]
  node tools/vedoy-shield/cli.mjs plan PROFILE [--target DIR] [--json]
  node tools/vedoy-shield/cli.mjs install PROFILE --target DIR --apply
  node tools/vedoy-shield/cli.mjs audit --target DIR

Installation is a dry-run unless --apply is passed explicitly.
No package is installed globally; npm lifecycle scripts are disabled for npm profiles.
Installing dependencies alone does NOT enable or validate any security feature.
`;

export function parseArgs(args) {
  const [command, ...rest] = args;
  const options = { command: command ?? "help", profile: null, target: ".", targetExplicit: false, apply: false, json: false };
  for (let i = 0; i < rest.length; i++) {
    const value = rest[i];
    if (value === "--apply") options.apply = true;
    else if (value === "--json") options.json = true;
    else if (value === "--target") {
      if (!rest[i + 1] || rest[i + 1].startsWith("--")) throw Error("--target requires a directory");
      options.target = rest[++i];
      options.targetExplicit = true;
    } else if (value.startsWith("--")) throw Error(`Unknown flag: ${value}`);
    else if (!options.profile) options.profile = value;
    else throw Error(`Unexpected argument: ${value}`);
  }
  if (options.apply && options.command !== "install") throw Error("--apply is only valid for install");
  if (options.command === "install" && options.apply && !options.targetExplicit) throw Error("An explicit --target DIR is required to apply changes");
  return options;
}

export function main(argv = process.argv.slice(2), write = console.log) {
  const opts = parseArgs(argv);
  if (["help", "--help", "-h"].includes(opts.command)) { write(usage); return 0; }
  if (opts.command === "list") {
    if (opts.profile) throw Error("list takes no profile");
    if (opts.json) write(JSON.stringify({ profiles: PROFILES, libraries: LIBRARIES }, null, 2));
    else {
      write("Available Shield profiles (run 'plan PROFILE --target DIR' first):");
      for (const [id, p] of Object.entries(PROFILES)) write(`  ${id.padEnd(19)} ${p.label}`);
    }
    return 0;
  }
  if (opts.command === "audit") {
    if (opts.profile) throw Error("audit takes no profile");
    const { directory } = loadTarget(opts.target);
    const command = process.platform === "win32" ? "npm.cmd" : "npm";
    const result = spawnSync(command, ["audit", "--omit=dev", "--audit-level=high"], { cwd: directory, stdio: "inherit", shell: false });
    if (result.error) throw result.error;
    return result.status ?? 1;
  }
  if (!["plan", "install"].includes(opts.command)) throw Error(`Unknown command: ${opts.command}`);
  if (!opts.profile) throw Error("Specify a profile (see 'list')");
  const plan = createPlan(opts.profile, opts.target);
  const proposed = plan.errors.length || plan.mode === "manual" ? null : installCommand(plan);
  if (opts.json) write(JSON.stringify({ ...plan, proposed, apply: opts.apply }, null, 2));
  else {
    write(`Vedoy Shield | ${plan.label} | ${plan.directory}`);
    for (const entry of plan.pending) write(`  + ${entry.name}${entry.version ? `@${entry.version}` : " (SDK matched)"}: ${entry.role}`);
    for (const entry of plan.existing) write(`  = ${entry.name}: already declared as ${entry.declared} (left untouched)`);
    for (const warning of plan.warnings) write(`  Note: ${warning}`);
    for (const error of plan.errors) write(`  BLOCKED: ${error}`);
    if (proposed) write(`  Proposed: ${proposed.command} ${proposed.args.join(" ")}`);
  }
  if (plan.errors.length) return 2;
  if (opts.command === "install") {
    const result = runInstall(plan, { apply: opts.apply });
    if (!opts.apply && !opts.json) write("DRY RUN ONLY. Add --apply with an explicit --target to install.");
    else if (!opts.json) write(`Result: ${result.status}. Configuration and security testing are still required.`);
  }
  return 0;
}

if (process.argv[1] && new URL(`file://${process.argv[1]}`).href === import.meta.url) {
  try { process.exitCode = main(); }
  catch (error) { console.error(`Vedoy Shield: ${error.message}`); process.exitCode = 2; }
}
