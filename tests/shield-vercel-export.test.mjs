import { strict as assert } from "node:assert";
import { test } from "node:test";
import { safeVercelSnapshot } from "../scripts/shield-export-vercel.mjs";

test("Shield Vercel export strips every credential value and nonallowlisted project field", () => {
  const secret = "SUPER_PRIVATE_TOKEN_XXX";
  const data = safeVercelSnapshot(
    {id: "prj_demo", name: "site", framework: "nextjs", nodeVersion: "24.x",
      link: {type: "github", org: "owner", repo: "site", token: secret},
      env: [{value: secret}], passwordProtection: {password: secret}},
    {domains: [{name: "example.org", verified: true, token: secret}]},
    {envs: [{key: "DATABASE_URL", type: "sensitive", target: ["production"], value: secret, decrypted: secret}]},
    "2026-11-10T00:00:00.000Z");
  const json = JSON.stringify(data);
  assert.equal(data.environmentVariableDescriptors[0].key, "DATABASE_URL");
  assert.ok(!json.includes(secret));
  assert.ok(!json.includes("passwordProtection"));
  assert.deepEqual(data.domains.map(x => x.name), ["example.org"]);
});
test("Shield Vercel export refuses malformed partial API responses", () => {
  assert.throws(() => safeVercelSnapshot({id:"prj_demo"}, {}, {envs: []}), /Incomplete/);
});
