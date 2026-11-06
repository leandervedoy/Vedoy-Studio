import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { LIBRARIES, PROFILES } from "../catalog.mjs";
import { createPlan, installCommand, runInstall } from "../installer.mjs";
import { main, parseArgs } from "../cli.mjs";

function fixture(dependencies, extra = {}) {
  const directory = mkdtempSync(join(tmpdir(), "shield-test-"));
  writeFileSync(join(directory, "package.json"), JSON.stringify({ private: true, dependencies, ...extra }));
  return { directory, cleanup: () => rmSync(directory, { recursive: true, force: true }) };
}

test("all catalogue entries are pinned except Expo SDK-matched module", () => {
  for (const [name, lib] of Object.entries(LIBRARIES)) {
    assert.match(name, /^(?:@[a-z0-9-]+\/)?[a-z0-9-]+$/);
    if (name === "expo-secure-store") assert.equal(lib.version, null);
    else assert.match(lib.version, /^\d+\.\d+\.\d+$/);
  }
  for (const profile of Object.values(PROFILES)) {
    for (const lib of profile.libraries) assert.ok(Object.hasOwn(LIBRARIES, lib));
  }
});

test("Next.js plan only adds missing pinned packages and never rewrites existing dependencies", () => {
  const x = fixture({ next: "^16.3.2", zod: "^4.6.2" });
  try {
    const plan = createPlan("nextjs", x.directory, 24);
    assert.deepEqual(plan.existing.map(x => x.name), ["zod"]);
    assert.deepEqual(plan.pending.map(x => x.name), ["jose", "dompurify"]);
    assert.deepEqual(installCommand(plan).args.slice(-2), ["jose@6.2.15", "dompurify@3.4.17"]);
    let spawned = false;
    const result = runInstall(plan, { runner: () => { spawned = true; throw Error("must not execute"); } });
    assert.equal(result.status, "dry-run");
    assert.equal(spawned, false);
  } finally { x.cleanup(); }
});

test("explicit apply passes vetted argv without a shell", () => {
  const x = fixture({ express: "^5.1.0" });
  try {
    const plan = createPlan("express", x.directory, 24);
    let observed;
    const result = runInstall(plan, { apply: true, runner: (command, args, options) => { observed = { command, args, options }; return { status: 0 }; } });
    assert.equal(result.status, "installed-dependencies-not-configured");
    assert.equal(observed.options.shell, false);
    assert.equal(observed.options.cwd, x.directory);
    assert.ok(observed.args.includes("--ignore-scripts"));
    assert.ok(observed.args.includes("--save-exact"));
    assert.ok(observed.args.includes("helmet@8.3.0"));
  } finally { x.cleanup(); }
});

test("rejects unsupported framework, npm tooling mismatch and outdated Node", () => {
  const x = fixture({ next: "^16.3.2" }, { packageManager: "pnpm@10.0.0" });
  try {
    const plan = createPlan("express", x.directory, 18);
    assert.ok(plan.errors.some(s => s.includes("express")));
    assert.ok(plan.errors.some(s => s.includes("npm")));
    assert.ok(plan.errors.some(s => s.includes("Node")));
    assert.throws(() => runInstall(plan, { apply: true }), /required|does not declare/);
  } finally { x.cleanup(); }
});

test("Fastify version mismatch is rejected; Expo version remains SDK-matched", () => {
  const f = fixture({ fastify: "^4.0.0" });
  const e = fixture({ expo: "^58.0.0" });
  try {
    assert.ok(createPlan("fastify", f.directory, 24).errors.some(s => s.includes("v5")));
    const plan = createPlan("expo", e.directory, 24);
    assert.equal(plan.errors.length, 0);
    assert.equal(plan.pending[0].version, null);
    assert.equal(installCommand(plan).args[0], "install");
  } finally { f.cleanup(); e.cleanup(); }
});

test("native React Native setup is explicitly manual", () => {
  const x = fixture({ "react-native": "^0.83.0" });
  try { assert.throws(() => installCommand(createPlan("react-native", x.directory, 24)), /manual platform/); }
  finally { x.cleanup(); }
});

test("CLI enforces an explicit target before applying and disallows arbitrary flags", () => {
  assert.throws(() => parseArgs(["install", "nextjs", "--apply"]), /explicit --target/);
  assert.throws(() => parseArgs(["install", "nextjs", "--target", "--apply"]), /requires a directory/);
  assert.throws(() => parseArgs(["install", "nextjs", "--target", ".", "--exec", "touch"]), /Unknown flag/);
  assert.throws(() => createPlan("arbitrary-package", process.cwd(), 24), /Unsupported profile/);
  const lines = [];
  assert.equal(main(["list"], x => lines.push(x)), 0);
  assert.ok(lines.some(s => s.includes("node-device")));
});
