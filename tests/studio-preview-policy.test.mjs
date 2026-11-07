import test from "node:test";
import assert from "node:assert/strict";
import { normalizePreviewEmail, isVerifiedPreviewOwner, isInternalPreviewAdmin, canViewDraft } from "../lib/studio-preview-policy.mjs";
const owner = { email: "leander@vedoy.store", role: "vedoy_owner", organizationId: "org_vedoy" };
const client = { email: "customer@example.com", role: "member", organizationId: "org_vedoy" };
const admin = { email: "employee@example.com", role: "admin", organizationId: "org_vedoy" };
const internalMember = { email: "employee@example.com", role: "admin", organizationId: "org_vedoy" };
test("emails normalize and malformed values fail", () => {
  assert.equal(normalizePreviewEmail(" Customer@Example.com "), "customer@example.com");
  assert.equal(normalizePreviewEmail("a@localhost"), null);
  assert.equal(normalizePreviewEmail("someone\n@example.com"), null);
});
test("only reserved owner identity receives owner privileges", () => {
  assert.equal(isVerifiedPreviewOwner(owner), true);
  assert.equal(isVerifiedPreviewOwner({ ...owner, role: "admin" }), false);
  assert.equal(isVerifiedPreviewOwner({ ...owner, email: "other@example.com" }), false);
});
test("customer session cannot administer previews", () => {
  assert.equal(isInternalPreviewAdmin(client, [internalMember]), false);
});
test("a matching internal team admin can administer previews", () => {
  assert.equal(isInternalPreviewAdmin(admin, [internalMember]), true);
});
test("a role alone, without internal membership, cannot administer", () => {
  assert.equal(isInternalPreviewAdmin(admin, []), false);
  assert.equal(isInternalPreviewAdmin({ ...admin, organizationId: "customer_org" }, [internalMember]), false);
});
test("shared drafts are visible but published pages do not appear in draft list", () => {
  assert.equal(canViewDraft({ visibility: "draft", isInternalAdmin: false, isGranted: true }), true);
  assert.equal(canViewDraft({ visibility: "draft", isInternalAdmin: false, isGranted: false }), false);
  assert.equal(canViewDraft({ visibility: "published", isInternalAdmin: true, isGranted: true }), false);
});
