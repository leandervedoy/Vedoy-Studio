import test from "node:test";
import assert from "node:assert/strict";
import { supabaseOAuthUrlFromEnv, managerDecision, safeStudioNext, managerLoginPath } from "../lib/vedoy-owner-access.mjs";

test("Studio OAuth uses the registered Vedoy Supabase issuer, not Neon", () => {
  assert.equal(supabaseOAuthUrlFromEnv({ VEDOY_LOGIN_SUPABASE_URL: "https://niedmgyyougvgiiuwcvw.supabase.co", VEDOY_LOGIN_NEON_AUTH_URL: "https://old.neon.tech" }), "https://niedmgyyougvgiiuwcvw.supabase.co");
});
test("OAuth fails closed if only Neon is available", () => {
  assert.equal(supabaseOAuthUrlFromEnv({ VEDOY_LOGIN_NEON_AUTH_URL: "https://old.neon.tech" }), null);
});
test("Only the intended HTTPS Supabase project is accepted", () => {
  for (const url of ["http://example.com","https://old.neon.tech","https://niedmgyyougvgiiuwcvw.supabase.co.evil.com","https://niedmgyyougvgiiuwcvw.supabase.co/other"]) {
    assert.equal(supabaseOAuthUrlFromEnv({ VEDOY_LOGIN_SUPABASE_URL: url }), null);
  }
});
test("unauthenticated manager user must log in without losing destination", () => {
  assert.equal(managerDecision(null), "login");
  assert.equal(managerLoginPath, "/login?next=%2Fstudio%2Fvedoy-manager");
});
test("legacy signed owner session needs re-auth, not access or generic 404", () => {
  assert.equal(managerDecision({ email: "leander@vedoy.store", role: "owner" }), "reauth");
});
test("only signed Vedoy owner role and exact account can enter manager", () => {
  assert.equal(managerDecision({ email: "LEANDER@VEDOY.STORE", role: "vedoy_owner" }), "allow");
  assert.equal(managerDecision({ email: "other@vedoy.store", role: "vedoy_owner" }), "notFound");
  assert.equal(managerDecision({ email: "other@vedoy.store", role: "owner" }), "notFound");
});
test("Studio return path blocks external redirects and preserves the manager path", () => {
  assert.equal(safeStudioNext("/studio/vedoy-manager"), "/studio/vedoy-manager");
  assert.equal(safeStudioNext("/studio"), "/studio");
  assert.equal(safeStudioNext("//attacker.test"), "/studio");
  assert.equal(safeStudioNext("https://attacker.test"), "/studio");
  assert.equal(safeStudioNext("/studio\\evil.test"), "/studio");
  assert.equal(safeStudioNext("/studio?next=https://evil.test"), "/studio");
});
