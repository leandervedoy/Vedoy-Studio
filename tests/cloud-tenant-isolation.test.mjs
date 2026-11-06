/**
 * Isolated route-level tenant regression test; no real Supabase project,
 * external network, OAuth credentials or production keys are used.
 * Run: node --test tests/cloud-tenant-isolation.test.mjs
 */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { randomUUID } from "node:crypto";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = resolve(import.meta.dirname, "..");
const alice = { sub: "alice_opaque_sub_0001", email: "alice@example.invalid", name: "Alice" };
const bob = { sub: "bob_opaque_sub_0002", email: "bob@example.invalid", name: "Bob" };
const A = randomUUID();
const B = randomUUID();
const FILE_A = randomUUID();
const PENDING_A = randomUUID();
const GITHUB_A = randomUUID();

const z = {
  string: () => schema("string"),
  number: () => schema("number"),
  enum: (values) => schema("enum", values),
  object: (fields) => ({ safeParse(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return { success: false };
    const data = {};
    for (const [key, field] of Object.entries(fields)) {
      const r = field.safeParse(value[key]);
      if (!r.success) return { success: false };
      if (r.data !== undefined) data[key] = r.data;
    }
    return { success: true, data };
  } }),
};
function schema(type, allowed) {
  const s = {
    type, allowed, minN: null, maxN: null, trimIt: false, integer: false, greater0: false, isOptional: false, isUUID: false,
    trim() { this.trimIt = true; return this; },
    min(n) { this.minN = n; return this; },
    max(n) { this.maxN = n; return this; },
    uuid() { this.isUUID = true; return this; },
    int() { this.integer = true; return this; },
    positive() { this.greater0 = true; return this; },
    optional() { this.isOptional = true; return this; },
    safeParse(raw) {
      if (raw === undefined && this.isOptional) return { success: true, data: undefined };
      const value = this.trimIt && typeof raw === "string" ? raw.trim() : raw;
      let valid = this.type === "enum" ? this.allowed.includes(value) : typeof value === this.type;
      if (this.type === "string" && valid) {
        if (this.minN !== null && value.length < this.minN) valid = false;
        if (this.maxN !== null && value.length > this.maxN) valid = false;
        if (this.isUUID && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) valid = false;
      }
      if (this.type === "number" && valid) {
        if (this.integer && !Number.isInteger(value)) valid = false;
        if (this.greater0 && value <= 0) valid = false;
        if (this.maxN !== null && value > this.maxN) valid = false;
      }
      return valid ? { success: true, data: value } : { success: false };
    },
  };
  return s;
}

function fixture() {
  let activeUser = null;
  const data = {
    vedoy_cloud_projects: [
      { id: A, owner_id: alice.sub, name: "A's private project", source: "manual", created_at: "2026-11-05" },
      { id: B, owner_id: bob.sub, name: "B's private project", source: "manual", created_at: "2026-11-05" },
      { id: GITHUB_A, owner_id: alice.sub, name: "Public example", source: "github", github_owner: "example", github_repo: "public", github_default_branch: "main", created_at: "2026-11-05" },
    ],
    vedoy_cloud_files: [
      { id: FILE_A, owner_id: alice.sub, project_id: A, storage_key: "alices/private", display_path: "secret.txt", size_bytes: 4, mime_type: "text/plain", status: "ready", created_at: "2026-11-05" },
      { id: PENDING_A, owner_id: alice.sub, project_id: A, storage_key: "alices/pending", display_path: "pending.txt", size_bytes: 4, mime_type: "text/plain", status: "pending", created_at: "2026-11-05" },
    ],
  };
  const objects = new Map([["alices/private", { size: 4 }], ["alices/pending", { size: 4 }]]);
  const calls = { signedDownloads: 0, signedUploads: 0, storageDeletes: 0, githubRequests: 0 };
  class Query {
    constructor(table) { this.table = table; this.action = "read"; this.predicates = []; this.head = false; this.projection = "*"; this.payload = null; this.max = 9999; }
    select(fields, options = {}) { this.projection = fields; this.head = options.head === true; return this; }
    eq(key, value) { this.predicates.push(row => row[key] === value); return this; }
    order() { return this; }
    limit(n) { this.max = n; return this; }
    insert(payload) { this.action = "insert"; this.payload = payload; return this; }
    update(payload) { this.action = "update"; this.payload = payload; return this; }
    delete() { this.action = "delete"; return this; }
    result() {
      const rows = data[this.table];
      let matched = rows.filter(row => this.predicates.every(p => p(row)));
      if (this.action === "read") return { data: this.head ? null : matched.slice(0, this.max), count: matched.length, error: null };
      if (this.action === "insert") {
        const item = { id: randomUUID(), created_at: new Date().toISOString(), ...this.payload };
        // This mimics the proposed DB invariant. The route must still authorize before insert.
        if (this.table === "vedoy_cloud_files" && !data.vedoy_cloud_projects.some(p => p.id === item.project_id && p.owner_id === item.owner_id)) return { data: null, error: Error("owner mismatch") };
        rows.push(item); return { data: [item], error: null };
      }
      if (this.action === "update") { matched.forEach(row => Object.assign(row, this.payload)); return { data: matched, error: null }; }
      if (this.action === "delete") { for (const row of matched) rows.splice(rows.indexOf(row), 1); return { data: matched, error: null }; }
      throw Error("Unknown query");
    }
    maybeSingle() { const result = this.result(); return Promise.resolve({ ...result, data: result.data?.[0] ?? null }); }
    single() { const result = this.result(); return Promise.resolve({ ...result, data: result.data?.[0] ?? null }); }
    then(resolve, reject) { return Promise.resolve(this.result()).then(resolve, reject); }
  }
  const storage = {
    from() { return {
      async createSignedUrl(key) { calls.signedDownloads++; return objects.has(key) ? { data: { signedUrl: `https://storage.invalid/download/${key}` }, error: null } : { error: Error("missing") }; },
      async createSignedUploadUrl(key) { calls.signedUploads++; return { data: { signedUrl: `https://storage.invalid/upload/${key}` }, error: null }; },
      async info(key) { return objects.has(key) ? { data: objects.get(key), error: null } : { error: Error("not uploaded") }; },
      async remove(keys) { calls.storageDeletes++; keys.forEach(key => objects.delete(key)); return { error: null }; },
      async upload(key, body) { objects.set(key, { size: body.length }); return { error: null }; },
    }; },
  };
  const db = { from(table) { if (!data[table]) throw Error("unexpected table " + table); return new Query(table); }, storage };
  const lib = {
    CLOUD_BUCKET: "vedoy-cloud-private", CLOUD_FILE_LIMIT: 10 * 1048576, CLOUD_OWNER_LIMIT: 100 * 1048576,
    CLOUD_SETTINGS: { maxFilesPerProject: 200 },
    cloudSession: async () => activeUser,
    cloudAdmin: () => db,
    cloudSameOrigin: (request) => request.headers.get("origin") === new URL(request.url).origin,
    cleanCloudPath: (value) => typeof value === "string" && value.length <= 500 && !value.split("/").some(x => !x || x === ".." || x === "." || x.startsWith(".")) ? value : null,
  };
  const fakeGithubFetch = async (url) => {
    calls.githubRequests++;
    const path = new URL(url).pathname;
    if (path === "/repos/example/public") return Response.json({ private: false, default_branch: "main", html_url: "https://github.com/example/public", name: "public" });
    if (path.endsWith("/git/trees/main")) return Response.json({ tree: [{ path: "README.md", type: "blob", sha: "abc", size: 4 }] });
    if (path.endsWith("/git/blobs/abc")) return Response.json({ encoding: "base64", content: Buffer.from("test").toString("base64"), size: 4 });
    return Response.json({ message: "Not Found" }, { status: 404 });
  };
  return { data, objects, calls, lib, fakeGithubFetch, setSession(u) { activeUser = u; } };
}

function route(path, ctx) {
  const source = readFileSync(resolve(root, path), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  const module = { exports: {} };
  const customRequire = (name) => {
    if (name === "@/lib/vedoy-cloud") return ctx.lib;
    if (name === "next/server") return { NextResponse: { json: (body, init = {}) => Response.json(body, init) } };
    if (name === "zod") return { z };
    return require(name);
  };
  const script = `(function(require,module,exports){${js}\n})`;
  const executable = runInNewContext(script, {
    Buffer, URL, URLSearchParams, Request, Response, AbortController, AbortSignal, setTimeout, clearTimeout,
    process, fetch: ctx.fakeGithubFetch, console,
  }, { filename: path });
  executable(customRequire, module, module.exports);
  return module.exports;
}
const endpoint = (path, params = "") => `https://cloud.test/api/cloud/${path}${params}`;
function req(url, method, body, origin = "https://cloud.test") {
  return new Request(url, { method, headers: { origin, "content-type": "application/json" }, body: body && JSON.stringify(body) });
}
async function statusAndBody(response) { return { status: response.status, body: await response.json() }; }

test("separate customer sessions: list, upload, confirm, download, delete and GitHub import", async (t) => {
  const ctx = fixture();
  const projects = route("app/api/cloud/projects/route.ts", ctx);
  const files = route("app/api/cloud/files/route.ts", ctx);
  const download = route("app/api/cloud/files/download/route.ts", ctx);
  const importer = route("app/api/cloud/projects/import/route.ts", ctx);
  await t.test("unauthenticated requests are denied", async () => {
    ctx.setSession(null);
    assert.equal((await projects.GET()).status, 401);
    assert.equal((await files.GET(new Request(endpoint("files", `?projectId=${A}`)))).status, 401);
    assert.equal((await download.GET(new Request(endpoint("files/download", `?id=${FILE_A}`)))).status, 401);
  });
  await t.test("each customer lists only their own projects", async () => {
    ctx.setSession(alice);
    const a = await (await projects.GET()).json();
    assert.deepEqual(a.projects.map(p => p.owner_id), [alice.sub, alice.sub]);
    ctx.setSession(bob);
    const b = await (await projects.GET()).json();
    assert.deepEqual(b.projects.map(p => p.owner_id), [bob.sub]);
  });
  await t.test("Bob cannot list or reserve storage in Alice's project", async () => {
    ctx.setSession(bob);
    assert.equal((await files.GET(new Request(endpoint("files", `?projectId=${A}`)))).status, 404);
    const result = await files.POST(req(endpoint("files"), "POST", { projectId: A, path: "stolen.txt", size: 4 }));
    assert.equal(result.status, 404);
    assert.equal(ctx.calls.signedUploads, 0);
  });
  await t.test("Bob cannot confirm, download or delete Alice's files", async () => {
    ctx.setSession(bob);
    assert.equal((await files.PATCH(req(endpoint("files"), "PATCH", { fileId: PENDING_A }))).status, 404);
    assert.equal((await download.GET(new Request(endpoint("files/download", `?id=${FILE_A}`)))).status, 404);
    assert.equal((await files.DELETE(req(endpoint("files", `?id=${FILE_A}`), "DELETE"))).status, 404);
    assert.equal(ctx.calls.signedDownloads, 0);
    assert.equal(ctx.calls.storageDeletes, 0);
    assert.ok(ctx.data.vedoy_cloud_files.some(f => f.id === FILE_A));
  });
  await t.test("Bob cannot delete or import Alice's projects", async () => {
    ctx.setSession(bob);
    assert.equal((await projects.DELETE(req(endpoint("projects", `?id=${A}`), "DELETE"))).status, 404);
    assert.equal((await importer.POST(req(endpoint("projects/import"), "POST", { projectId: GITHUB_A }))).status, 404);
    assert.equal(ctx.calls.githubRequests, 0);
    assert.ok(ctx.data.vedoy_cloud_projects.some(p => p.id === A));
  });
  await t.test("cross-origin requests cannot mutate either tenant", async () => {
    ctx.setSession(alice);
    assert.equal((await files.POST(req(endpoint("files"), "POST", { projectId: A, path: "x.txt", size: 4 }, "https://evil.invalid"))).status, 403);
    assert.equal((await projects.DELETE(req(endpoint("projects", `?id=${A}`), "DELETE", null, "https://evil.invalid"))).status, 403);
  });
  await t.test("Alice can reserve, confirm and download her own file", async () => {
    ctx.setSession(alice);
    const grant = await statusAndBody(await files.POST(req(endpoint("files"), "POST", { projectId: A, path: "private/code.txt", size: 4, contentType: "text/plain" })));
    assert.equal(grant.status, 201);
    assert.equal(ctx.calls.signedUploads, 1);
    const row = ctx.data.vedoy_cloud_files.find(f => f.id === grant.body.fileId);
    ctx.objects.set(row.storage_key, { size: 4 });
    assert.equal((await files.PATCH(req(endpoint("files"), "PATCH", { fileId: grant.body.fileId }))).status, 200);
    assert.equal(row.status, "ready");
    const signed = await statusAndBody(await download.GET(new Request(endpoint("files/download", `?id=${grant.body.fileId}`))));
    assert.equal(signed.status, 200);
    assert.match(signed.body.url, /storage\.invalid/);
    assert.equal((await files.DELETE(req(endpoint("files", `?id=${grant.body.fileId}`), "DELETE"))).status, 200);
    assert.ok(!ctx.objects.has(row.storage_key));
  });
  await t.test("Alice can perform a limited public GitHub import; Bob still sees none of it", async () => {
    ctx.setSession(alice);
    const imported = await statusAndBody(await importer.POST(req(endpoint("projects/import"), "POST", { projectId: GITHUB_A })));
    assert.equal(imported.status, 200);
    assert.equal(imported.body.imported, 1);
    assert.match(imported.body.note, /ikke en Git-klone/);
    ctx.setSession(bob);
    assert.equal((await files.GET(new Request(endpoint("files", `?projectId=${GITHUB_A}`)))).status, 404);
  });
});

test("database migration must enforce owner/project consistency and atomic quota reservations", () => {
  const sql = readFileSync(resolve(root, "supabase/migrations/20261105_vedoy_cloud_projects.sql"), "utf8");
  assert.match(sql, /foreign key\s*\(project_id\s*,\s*owner_id\)/i);
  assert.match(sql, /references\s+public\.vedoy_cloud_projects\s*\(id\s*,\s*owner_id\)/i);
  assert.match(sql, /pg_advisory_xact_lock/i);
  assert.match(sql, /104857600/);
  assert.match(sql, /200/);
  assert.match(sql, /30/);
});

test("cookie integrity and fail-closed preview database selection", async () => {
  const source = readFileSync(resolve(root, "lib/vedoy-cloud.ts"), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  const module = { exports: {} };
  const env = {
    NODE_ENV: "test",
    VERCEL_ENV: "preview",
    SESSION_SECRET: "test-only-random-key-not-a-production-secret-1234",
    VEDOY_SUPABASE_URL: "https://niedmgyyougvgiiuwcvw.supabase.co",
    VEDOY_SUPABASE_SECRET_KEY: "test-only-not-real",
  };
  const executable = runInNewContext(`(function(require,module,exports){${js}\n})`, {
    Buffer, URL, console, process: { env }, Request,
  }, { filename: "lib/vedoy-cloud.ts" });
  executable((name) => {
    if (name === "next/headers") return { cookies: async () => ({ get: () => null }) };
    if (name === "@supabase/supabase-js") return { createClient: (url) => ({ connectedTo: url }) };
    return require(name);
  }, module, module.exports);
  const cloud = module.exports;
  const cookie = cloud.newCloudCookie(alice);
  assert.ok(cloud.parseCloudCookie(cookie.value)?.sub === alice.sub);
  const altered = cookie.value.slice(0, -1) + (cookie.value.at(-1) === "A" ? "B" : "A");
  assert.equal(cloud.parseCloudCookie(altered), null, "modified signatures must be rejected");
  assert.equal(cloud.parseCloudCookie("wrong-format"), null);
  assert.equal(cookie.httpOnly, true);
  assert.throws(() => cloud.cloudAdmin(), /preview requires its own Supabase project/);
  env.VEDOY_SUPABASE_URL = "";
  assert.throws(() => cloud.cloudAdmin(), /explicitly configured/);
  env.VEDOY_SUPABASE_URL = "https://isolated-staging.supabase.co";
  assert.equal(cloud.cloudAdmin().connectedTo, env.VEDOY_SUPABASE_URL);
  env.VERCEL_ENV = "production";
  assert.throws(() => cloud.cloudAdmin(), /disabled pending launch approval/);
  env.VEDOY_CLOUD_ENABLED = "true";
  assert.equal(cloud.cloudAdmin().connectedTo, env.VEDOY_SUPABASE_URL);
});
