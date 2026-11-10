import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const model=readFileSync("lib/digital-products/vedoy-clear-css.ts","utf8");
const page=readFileSync("app/(marketing)/produkter/vedoy-css-digital-simplicity/page.tsx","utf8");
test("GBP commercial price is exactly 3.00",()=>assert.match(model,/GBP:\s*\{ amountMinor: 300, formatted: "£3.00" \}/));
test("product is listed pending secure delivery",()=>{assert.match(model,/status: "listed"/);assert.match(model,/delivery: "secure-download-pending"/)});
test("storefront does not accept payments prematurely",()=>{assert.match(page,/Kommer snart/);assert.doesNotMatch(page,/checkout\.sessions\.create/)});

test("public product title is consistent",()=>{assert.match(model,/title: "Vedoy CSS Digital Simplicity"/);assert.match(page,/Vedoy CSS Digital Simplicity/)});
