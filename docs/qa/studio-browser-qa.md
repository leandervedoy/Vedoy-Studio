# Vedoy Studio - browser-based customer journey tests

The `tests/e2e/studio-customer.spec.mjs` suite uses Playwright to walk through
the exact customer workflow on an **isolated Vercel preview**, including mobile
screenshots and negative authorization cases. It is opt-in and **was not run
against production**.

## Prepare a safe environment

- Use a non-production `*.vercel.app` preview (or localhost) with synthetic
  data and no real customers. The test refuses other hostnames.
- Run the normal preview migrations on that **test** database, including:
  `npm run db:migrate:page-preview-access`.
- Provision two synthetic customer logins A/B and one synthetic test admin,
  and use the app's normal signed Studio session cookie (do not invent tokens).
- Grant one synthetic *draft* page only to customer A.

Set the following environment variables **in an isolated runner or CI secrets**:
`VEDOY_E2E_BASE_URL`, `VEDOY_TEST_CUSTOMER_A_SESSION`,
`VEDOY_TEST_CUSTOMER_B_SESSION`, `VEDOY_TEST_OWNER_SESSION`,
`VEDOY_TEST_DRAFT_ID`, `VEDOY_TEST_DRAFT_TITLE`.

Never commit tokens, exported browser storage state, real customer information,
or a real `.env` file. Ensure traces, video and screenshots are protected
CI artifacts with limited retention, because these may contain account details.

## Run

```sh
npm install --no-save --package-lock=false @playwright/test
npx playwright install chromium
npx playwright test --config playwright.studio.config.mjs
```

The tests check login redirects; project lists and assigned private drafts;
opening a draft by clicking; customer B denial including direct URL; API
authorization; cross-origin POST denial; mobile overflow; screenshots.

These tests **complement** rather than replace a security audit: other
Studio modules must be tenant-isolated before production customer testing.
Complete UX accessibility audits need a real browser session and visual checks.
