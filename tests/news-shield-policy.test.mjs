import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeModerationText, evaluatePublicMessage } from "../lib/shield-policy.mjs";
test("identifies case- and punctuation-insensitive matches for review", () => {
  assert.equal(evaluatePublicMessage("DU ER EN IDIOT!", ["du er en idiot"]).flagged, true);
  assert.equal(evaluatePublicMessage("En helt vanlig diskusjon", ["du er en idiot"]).flagged, false);
});
test("uses word boundaries and does not match substrings", () => {
  assert.equal(evaluatePublicMessage("utviklingshistorie", ["vikling"]).flagged, false);
});
test("flags multiple links without permanently banning", () => {
  assert.equal(evaluatePublicMessage("https://a.no https://b.no").flagged, true);
});
test("normalizes Unicode and punctuation", () => {
  assert.equal(normalizeModerationText(" HEI!\u200B  DU "), "hei du");
});
