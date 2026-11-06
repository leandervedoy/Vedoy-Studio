import { existsSync, readFileSync, realpathSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { LIBRARIES, PROFILES } from "./catalog.mjs";

const DEP_KEYS = ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"];

export function loadTarget(folder) {
  const directory = realpathSync(resolve(folder));
  const file = join(directory, "package.json");
  if (!existsSync(file)) throw Error(`No package.json in target: ${directory}`);
  let manifest;
  try { manifest = JSON.parse(readFileSync(file, "utf8")); }
  catch { throw Error("Target package.json must be valid JSON"); }
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) throw Error("Invalid package.json object");
  return { directory, manifest };
}

export function inspectProject(packageJson, directory = "") {
  const declared = Object.assign({}, ...DEP_KEYS.map(key => packageJson[key] ?? {}));
  const configuredManager = String(packageJson.packageManager ?? "");
  const otherLock = ["pnpm-lock.yaml", "yarn.lock", "bun.lock", "bun.lockb"].find(name => directory && existsSync(join(directory, name)));
  const usesOtherManager = Boolean(otherLock) || /^(pnpm|yarn|bun)@/.test(configuredManager);
  return { declared, otherLock, configuredManager, usesOtherManager, isWorkspaceRoot: Boolean(packageJson.workspaces) };
}

export function createPlan(profileId, target, nodeMajor = Number(process.versions.node.split(".")[0])) {
  const profile = PROFILES[profileId];
  if (!profile) throw Error(`Unsupported profile: ${profileId}`);
  const { directory, manifest } = loadTarget(target);
  const project = inspectProject(manifest, directory);
  const errors = [];
  const warnings = [profile.note];
  if (nodeMajor < profile.nodeMin) errors.push(`Node.js ${profile.nodeMin}+ required for ${profileId}; detected Node ${nodeMajor}`);
  if (profile.framework && !Object.hasOwn(project.declared, profile.framework)) errors.push(`Target does not declare ${profile.framework} as a dependency`);
  if (profile.frameworkMajor) {
    const version = project.declared[profile.framework] ?? "";
    if (!new RegExp(`(?:^|[^0-9])${profile.frameworkMajor}\\.`).test(version)) errors.push(`${profile.framework} v${profile.frameworkMajor} required; found ${version}`);
  }
  if (project.usesOtherManager) errors.push(`Only npm installation is supported; detected ${project.otherLock || project.configuredManager}`);
  if (project.isWorkspaceRoot) warnings.push("Target is a workspace root; installing packages here modifies the root dependency list.");
  const existing = [];
  const pending = [];
  for (const name of profile.libraries) {
    const lib = LIBRARIES[name];
    if (Object.hasOwn(project.declared, name)) {
      existing.push({ name, declared: project.declared[name], proposed: lib.version, note: "Existing dependency will not be changed; review its version and audit status." });
    } else {
      pending.push({ name, version: lib.version, role: lib.role });
    }
  }
  if (profile.mode === "manual") warnings.push("This native profile is documentation only; Shield refuses unattended native installation.");
  if (profile.mode === "expo") warnings.push("Expo SDK-compatible versions are selected by Expo, not by the npm catalog pin.");
  return { profileId, label: profile.label, directory, mode: profile.mode, pending, existing, errors, warnings };
}

export function installCommand(plan) {
  if (plan.errors.length) throw Error(plan.errors.join("; "));
  if (plan.mode === "manual") throw Error("This profile requires manual platform integration; see docs/vedoy-shield-library-catalog.md");
  if (!plan.pending.length) return null;
  if (plan.mode === "expo") return { command: join(plan.directory, "node_modules", ".bin", process.platform === "win32" ? "expo.cmd" : "expo"), args: ["install", ...plan.pending.map(x => x.name)] };
  if (plan.mode === "npm") return {
    command: process.platform === "win32" ? "npm.cmd" : "npm",
    args: ["install", "--save-exact", "--ignore-scripts", "--no-audit", "--no-fund", "--", ...plan.pending.map(x => `${x.name}@${x.version}`)],
  };
  throw Error("Unsupported installer mode");
}

export function runInstall(plan, { apply = false, runner = spawnSync } = {}) {
  if (plan.errors.length) throw Error(plan.errors.join("; "));
  const proposed = installCommand(plan);
  if (!apply) return { status: "dry-run", proposed };
  if (!proposed) return { status: "already-declared", proposed: null };
  if (plan.mode === "expo" && !existsSync(proposed.command)) throw Error("Local Expo CLI is missing. Run npm install in the Expo project first.");
  const result = runner(proposed.command, proposed.args, { cwd: plan.directory, stdio: "inherit", shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) throw Error(`Install failed with exit code ${result.status ?? "unknown"}`);
  return { status: "installed-dependencies-not-configured", proposed };
}
