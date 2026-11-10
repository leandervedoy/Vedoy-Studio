import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const model=readFileSync("lib/digital-products/vedoy-clear-css.ts","utf8");
const page=readFileSync("app/(marketing)/produkter/vedoy-clear-css/page.tsx","utf8");
test("GBP commercial price is exactly 3.00",()=>assert.match(model,/GBP:\s*\{ amountMinor: 300, formatted: "£3.00" \}/));
test("product is draft pending secure delivery",()=>{assert.match(model,/status: "draft"/);assert.match(model,/delivery: "secure-download-pending"/)});
test("storefront does not accept payments prematurely",()=>{assert.match(page,/Kommer snart/);assert.doesNotMatch(page,/checkout\.sessions\.create/)});
