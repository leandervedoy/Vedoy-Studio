# Vedoy Pay · Wallester + Aera foundation (preview only)

## Current scope

- Studio page: /studio/pay, behind existing signed Vedøy ID.
- Users can customize a cosmetic card design and save or delete it in PostgreSQL.
- GET/PUT/DELETE /api/vedoy-pay enforce verified session UUID + organization scope; mutation uses same-origin protection and an explicit design allowlist.
- Verified-partner status is displayed only from backend-owned link records. Neither end users nor the browser can create these links.
- Separate internal loyalty ledger is read-only. No synthetic bank balance, fake card number, customer money balance, or fictional coin balance.
- All database tables have RLS enabled and no public/anonymous/authenticated direct grants. Access is via authenticated server operations.
- No payment execution endpoints are created. The database migration is intentionally **not applied automatically**.

## Provider reality / API contract

**Wallester** documentation: https://api-frontend.wallester.com/v1/doc/
Wallester provides company accounts, account/card detail and card issuance for approved programs. Its Business API requires an API key and a short-lived RS256 signed JWT for each request (the API documents a 5-second token lifespan). Do not call with a static bearer token, accept unverified client-supplied company/account IDs, or expose encrypted PAN/CVV endpoints to the web. A company account on Wallester Business is not automatically a consumer bank account or a universal Norwegian IBAN. Use the approved contractual product program, read-only access and tenant mapping first.

**Aera** documentation: https://api-docs.aerahost.com/ and https://aera.readme.io/docs/getting-started-2
Production access requires an agreement, API key and (for most routes) bearer token. Wallet and identification SDKs have separate documentation. Do not invent endpoints, start OAuth or issue tokens without approved partner integration details. Aera is a wallet/identification solution; do not assume it issues IBANs or Visa cards.

For either provider:
1. Obtain contract, scope, permitted country and customer type, test credentials, sandbox details, callback and webhook specification.
2. Complete provider onboarding, identity/KYC, PCI-DSS scope assessment, GDPR DPA and licensing assessment with qualified advisers.
3. Map provider-side customer/company/card owner to a verified Vedøy ID server-side. Never trust link IDs from request bodies.
4. Add a dedicated typed adapter using server-only secrets, pinned HTTPS hostnames, per-request short-lived authorization and bounded timeouts.
5. Verify signed callbacks, deduplicate events by provider event ID and write an append-only audit trail.
6. Return only sanitized metadata (last4, brand, status) for eligible linked cards; do not store or serve PAN, CVC, PIN or bank credentials.
7. Keep all card-ordering, transfers, NFC and balances behind explicit reviewed release flags until independent security and regulatory review.

## Development and review

Run locally in an isolated database:
- npm install
- node --test tests/vedoy-pay-foundation.test.mjs
- npm run typecheck
- Review data/vedoy-pay-schema.sql
- **Only on an approved non-production database:** npm run db:migrate:vedoy-pay (after the script is added to package.json), or run scripts/migrate-vedoy-pay.mjs directly with DATABASE_URL.

The app uses existing Postgres getSql() rather than a new client-side Supabase key. No production database changes are performed by this PR.

## Liveness and security limitations

The presence of WALLESTER_API_TOKEN or AERA_API_TOKEN alone is **not** proof of partner service readiness. VEDOY_PAY_WALLESTER_APPROVED and VEDOY_PAY_AERA_APPROVED must be explicitly approved and set server-side. These currently only affect a *configuration indicator*, not network requests.

Vedoy Shield here consists of field allowlisting, authentication boundaries, idempotency design requirements, RLS/grant isolation, no-store responses, and safe deployment controls; it is not proof of security certification or a complete post-quantum payment stack.

A further review is necessary before launch: provider contracts, authorized payment flow, refunds/chargebacks, ledger invariants, per-transaction idempotency, fraud/rate limits, penetration test, accessibility, privacy, DPIA if warranted and regulatory opinion on e-money/loyalty.

## Isolated Vedoy Pay Sandbox (no provider credentials required)

Path: `/studio/pay/sandbox`, linked from the Studio Pay dashboard.

This is a local deterministic **mock**, not Wallester's or Aera's certified provider sandbox:
- Open a simulated demo account and top up with fake NOK amounts.
- Create virtual demo cards (without PAN/CVC) and simulate physical card orders.
- Run approved, declined or local 3D Secure challenge scenarios. **This is not real 3DS or BankID.**
- Grant and transfer fictional demo-Coins to a fixed mock recipient called "Testmottaker".
- View an in-memory audit-style event history, reset the simulation, and test duplicate idempotency keys.
- Zero network calls to banking/financial providers, no issuer or processor involvement.
- Does not touch database, Rewards, Sent, partner accounts, or payment webhooks.
- State lives in browser memory only and resets on page reload.

Run `node --test tests/vedoy-pay-sandbox.test.mjs` for deterministic engine checks.
The real provider sandboxes can be integrated only after the respective partner agreements and credentials.
