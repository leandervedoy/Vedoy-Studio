import test from "node:test";
import assert from "node:assert/strict";
import { neonAuthUrlFromEnv, managerDecision, safeStudioNext, managerLoginPath } from "../lib/vedoy-owner-access.mjs";

test("OAuth callback uses existing VITE_NEON_AUTH_URL when new env is absent", () => {
  assert.equal(neonAuthUrlFromEnv({ VITE_NEON_AUTH_URL: "https://identity.example.net" }), "https://identity.example.net");
});
test("explicit OAuth provider env wins over fallback", () => {
  assert.equal(neonAuthUrlFromEnv({ VEDOY_LOGIN_NEON_AUTH_URL: "https://specific.example.net", VITE_NEON_AUTH_URL: "https://fallback.example.net" }), "https://specific.example.net");
});
test("missing OAuth URL stays unconfigured", () => {
  assert.equal(neonAuthUrlFromEnv({}), null);
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
