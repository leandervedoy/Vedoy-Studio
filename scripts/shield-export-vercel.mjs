#!/usr/bin/env node
// Shield backup: export Vercel configuration metadata with a strict allowlist.
// NEVER export environment variable values, passwords, tokens or decrypted secrets.
import { fileURLToPath } from "node:url";
import { writeFile } from "node:fs/promises";

export function safeVercelSnapshot(project, domainsResponse, envResponse, capturedAt = new Date().toISOString()) {
  const domains = domainsResponse?.domains;
  const envs = envResponse?.envs;
  if (!project?.id || !Array.isArray(domains) || !Array.isArray(envs)) {
    throw new Error("Incomplete Vercel API response; refusing partial backup.");
  }
  return {
    format: "vedoy-shield-vercel-metadata-v1",
    capturedAt,
    project: {
      id: project.id,
      name: project.name ?? null,
      framework: project.framework ?? null,
      nodeVersion: project.nodeVersion ?? null,
      rootDirectory: project.rootDirectory ?? null,
      buildCommand: project.buildCommand ?? null,
      installCommand: project.installCommand ?? null,
      outputDirectory: project.outputDirectory ?? null,
      git: project.link ? {
        type: project.link.type ?? null,
        org: project.link.org ?? null,
        repo: project.link.repo ?? null
      } : null
    },
    domains: domains.map(domain => ({
      name: domain.name,
      verified: Boolean(domain.verified),
      gitBranch: domain.gitBranch ?? null,
      redirect: domain.redirect ?? null,
      redirectStatusCode: domain.redirectStatusCode ?? null
    })),
    environmentVariableDescriptors: envs.map(env => ({
      key: env.key,
      type: env.type ?? null,
      target: env.target ?? [],
      gitBranch: env.gitBranch ?? null
    })),
    excludes: ["environment-variable-values", "credentials", "deployment-artifacts", "dns-zone", "external-databases"]
  };
}

async function fetchVercel(path, teamId, token) {
  const url = new URL(path, "https://api.vercel.com");
  url.searchParams.set("teamId", teamId);
  const response = await fetch(url, {
    headers: { Authorization: "Bearer " + token, Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
    cache: "no-store"
  });
  if (!response.ok) throw new Error("Vercel API request failed: HTTP " + response.status);
  return response.json();
}

async function main() {
  const { VERCEL_TOKEN, VERCEL_TEAM_ID, VERCEL_PROJECT_ID } = process.env;
  const path = process.argv[2];
  if (!VERCEL_TOKEN || !VERCEL_TEAM_ID || !VERCEL_PROJECT_ID || !path) {
    throw new Error("VERCEL_TOKEN, VERCEL_TEAM_ID, VERCEL_PROJECT_ID and output path required.");
  }
  const projectPath = "/v9/projects/" + encodeURIComponent(VERCEL_PROJECT_ID);
  const [project, domains, envs] = await Promise.all([
    fetchVercel(projectPath, VERCEL_TEAM_ID, VERCEL_TOKEN),
    fetchVercel(projectPath + "/domains", VERCEL_TEAM_ID, VERCEL_TOKEN),
    fetchVercel("/v10/projects/" + encodeURIComponent(VERCEL_PROJECT_ID) + "/env", VERCEL_TEAM_ID, VERCEL_TOKEN)
  ]);
  if (project.id !== VERCEL_PROJECT_ID) throw new Error("Unexpected Vercel project ID.");
  const result = safeVercelSnapshot(project, domains, envs);
  await writeFile(path, JSON.stringify(result, null, 2) + "\n", { mode: 0o600, flag: "wx" });
  console.log("Vercel metadata snapshot written; secrets and values excluded.");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(err => {
    console.error("Shield Vercel export failed:", err.message);
    process.exitCode = 1;
  });
}
