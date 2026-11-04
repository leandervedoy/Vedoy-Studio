import assert from "node:assert/strict";
import { test } from "node:test";
import { resolvePricingInquiry } from "../lib/pricing-bridge.mjs";

const publishedPrices = [
  { code: "nettside-drift", title: "Nettside & Drift", amountOre: 49000, setupOre: 100000, billingPeriod: "month", currency: "NOK", vatMode: "excl", version: 2 },
  { code: "totalpartner", title: "Vedøy Totalpartner", amountOre: 99000, setupOre: 0, billingPeriod: "month", currency: "NOK", vatMode: "excl", version: 5 }
];

test("reuse the published Developer Portal prices for existing Studio leads", () => {
  const result = resolvePricingInquiry({ planCode: "nettside-drift", addonCode: "totalpartner", amountOre: 1 }, publishedPrices);
  assert.equal(result.main.code, "nettside-drift");
  assert.equal(result.addon.code, "totalpartner");
  assert.match(result.summary, /Kilde: Vedøy Pricing/);
  assert.match(result.summary, /Nettside & Drift/);
  assert.match(result.summary, /490 kr/);
  assert.match(result.summary, /990 kr/);
  assert.doesNotMatch(result.summary, /0,01 kr/);
  assert.match(result.summary, /Versjon: 2/);
});

test("unknown packages must never be stored as a valid quote", () => {
  assert.throws(() => resolvePricingInquiry({ planCode: "forged-plan" }, publishedPrices), /UNKNOWN_PLAN/);
});

test("reject duplicate add-ons rather than charging twice", () => {
  assert.throws(() => resolvePricingInquiry({ planCode: "totalpartner", addonCode: "totalpartner" }, publishedPrices), /DUPLICATE_PLAN/);
});

test("reject malicious or malformed product identifiers", () => {
  assert.throws(() => resolvePricingInquiry({ planCode: "../private" }, publishedPrices), /INVALID_PLAN/);
});

test("standalone plan has no optional addon", () => {
  const r = resolvePricingInquiry({ planCode: "totalpartner" }, publishedPrices);
  assert.equal(r.addon, null);
  assert.match(r.summary, /990 kr/);
});
