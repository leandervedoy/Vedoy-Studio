import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { SHIELD_SITE_HEADERS, SHIELD_PRIVATE_HEADERS } from "../lib/vedoy-shield-headers.mjs";

const pairs = (headers) => new Map(headers.map(({ key, value }) => [key.toLowerCase(), value]));

test("Shield site headers include the browser security baseline without duplicate fields", () => {
  const site = pairs(SHIELD_SITE_HEADERS);
  assert.equal(site.size, SHIELD_SITE_HEADERS.length);
  assert.equal(site.get("x-content-type-options"), "nosniff");
  assert.equal(site.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.equal(site.get("permissions-policy"), "camera=(), microphone=(), geolocation=()");
  assert.ok((site.get("strict-transport-security") ?? "").startsWith("max-age="));
  assert.match(site.get("content-security-policy") ?? "", /base-uri 'self'/);
  assert.match(site.get("content-security-policy") ?? "", /object-src 'none'/);
  // A strict script-src may break existing Next.js, authentication and payment integrations.
  assert.doesNotMatch(site.get("content-security-policy") ?? "", /script-src/);
});

test("Shield private headers prevent framing and caching of sensitive screens", () => {
  const privateHeaders = pairs(SHIELD_PRIVATE_HEADERS);
  assert.equal(privateHeaders.size, SHIELD_PRIVATE_HEADERS.length);
  assert.equal(privateHeaders.get("x-frame-options"), "DENY");
  assert.match(privateHeaders.get("cache-control") ?? "", /no-store/);
});

test("Next.js applies Shield site-wide, with stronger controls on private paths", () => {
  const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
  assert.ok(config.includes('import { SHIELD_SITE_HEADERS, SHIELD_PRIVATE_HEADERS }'));
  assert.match(config, /source: "\/\(\.\*\)", headers: SHIELD_SITE_HEADERS/);
  for (const source of ["/studio/:path*", "/login", "/auth/:path*", "/api/auth/:path*", "/api/cloud/:path*", "/api/vedoy-manager/:path*", "/api/team/:path*"]) {
    assert.ok(config.includes(`source: "${source}", headers: SHIELD_PRIVATE_HEADERS`), `Shield missing on ${source}`);
  }
});
