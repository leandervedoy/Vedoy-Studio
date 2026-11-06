# Vedoy Shield – Vedoy Studio web integration (v1)

Status: a **real, limited** browser/HTTP hardening layer for vedoystudio.no, Insights and Studio. It is **not** the planned complete Vedoy Shield cryptography product.

## Enabled in `next.config.ts`

- All routes: `X-Content-Type-Options: nosniff`, strict-origin-when-cross-origin referrer policy, existing camera/microphone/geolocation restrictions, HSTS (six months, no `includeSubDomains`), basic CSP (`base-uri 'self'; object-src 'none'`), and no legacy cross-domain policies.
- Sensitive areas (`/studio/*`, `/login`, `/auth/*`, `/api/auth/*`, `/api/cloud/*`, `/api/vedoy-manager/*`, `/api/team/*`): deny iframes via `X-Frame-Options: DENY` and `Cache-Control: private, no-store`.
- These policies are response headers. They don't implement account authorization or protect an API whose handler lacks authentication.

## Deliberately not claimed

- No end-to-end message encryption or post-quantum guarantees.
- No new encryption keys, automatic key rotation or key vault.
- No new WAF, DDoS filtering, endpoint-specific rate limiting or vulnerability audit.
- CSP does not yet set `script-src`, `connect-src` or `frame-src`; these require testing against Next.js, OAuth, Stripe, analytics and demo integrations before enforcement.
- Existing API authentication, origin checks and tenant authorization must still be tested separately.

## Verification

- `node --test tests/vedoy-shield-headers.test.mjs`
- Test the response headers for `/`, `/insights`, `/studio`, `/login`, `/api/cloud/projects` after deployment.
- Check OAuth login, Stripe checkout, Vercel Analytics, Studio navigation and external embeds after deployment.
- Only claim Shield as active on a live domain after the corresponding production deployment is READY and its response headers are observed.

Changes to this layer should undergo security review before adding restrictive script policies or request-blocking middleware.
