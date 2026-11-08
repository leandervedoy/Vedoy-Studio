import test from "node:test";
import assert from "node:assert/strict";
import { PAY_COLORS, validatePayDesign, payIdentityIsVerified, allowLinkedPartner, VEDOY_PAY_ACTIONS } from "../lib/vedoy-pay/validation.mjs";
const good = {color:"fjord",pattern:"waves",label:"Vedoy Collective"};
test("accepts an allowlisted cosmetic design", () => assert.deepEqual(validatePayDesign(good), good));
test("normalizes cosmetic label", () => assert.equal(validatePayDesign({...good,label:"  VEDOY  "}).label,"VEDOY"));
test("rejects raw card number and CVC fields", () => {
  assert.throws(() => validatePayDesign({...good,pan:"4242424242424242"}));
  assert.throws(() => validatePayDesign({...good,cvc:"123"}));
  assert.throws(() => validatePayDesign({...good,label:"4242 4242 4242 4242"}));
});
test("rejects unapproved colors or patterns", () => {
  assert.throws(() => validatePayDesign({...good,color:"<script>"}));
  assert.throws(() => validatePayDesign({...good,pattern:"gold-print"}));
});
test("rejects malformed labels", () => {
  assert.throws(() => validatePayDesign({...good,label:""}));
  assert.throws(() => validatePayDesign({...good,label:"a".repeat(25)}));
  assert.throws(() => validatePayDesign({...good,label:"<b>hello</b>"}));
});
test("validates verified identity shape", () => {
  assert.equal(payIdentityIsVerified("123e4567-e89b-42d3-a456-426614174000"), true);
  assert.equal(payIdentityIsVerified("any-email@example.com"), false);
});
test("unverified provider links do not authorize provider reads", () => {
  const time = new Date(Date.now()-60000).toISOString();
  assert.equal(allowLinkedPartner("pending",time),false);
  assert.equal(allowLinkedPartner("verified",time),true);
  assert.equal(allowLinkedPartner("verified",""),false);
  assert.equal(allowLinkedPartner("verified",new Date(Date.now()+60000).toISOString()),false);
});
test("all financial actions fail closed", () => {
  assert.ok(PAY_COLORS.includes("fjord"));
  assert.equal(VEDOY_PAY_ACTIONS.issueCard,false);
  assert.equal(VEDOY_PAY_ACTIONS.openBankAccount,false);
  assert.equal(VEDOY_PAY_ACTIONS.transferCoins,false);
  assert.equal(VEDOY_PAY_ACTIONS.chargeCustomer,false);
});
