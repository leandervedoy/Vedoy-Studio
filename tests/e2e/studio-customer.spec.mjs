import { test, expect } from "@playwright/test";

/**
 * True customer journey tests for the current Vercel PREVIEW.
 * Never point this at production, use only synthetic identities/data.
 * Signed cookies are injected via CI secrets; NEVER commit or print them.
 *
 * Setup requirements:
 * VEDOY_E2E_BASE_URL              Preview *.vercel.app or localhost URL
 * VEDOY_TEST_CUSTOMER_A_SESSION   Signed synthetic customer A session
 * VEDOY_TEST_CUSTOMER_B_SESSION   Signed synthetic customer B session
 * VEDOY_TEST_OWNER_SESSION        Signed synthetic test-admin session
 * VEDOY_TEST_DRAFT_ID             Synthetic unpublished, customer-A-granted page
 * VEDOY_TEST_DRAFT_TITLE          Title of the synthetic test page
 */
const base = process.env.VEDOY_E2E_BASE_URL || "";
const hostname = (() => { try { return new URL(base).hostname.toLowerCase(); } catch { return ""; } })();
const allowedHost = hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".vercel.app");
const credentials = {
  a: process.env.VEDOY_TEST_CUSTOMER_A_SESSION || "",
  b: process.env.VEDOY_TEST_CUSTOMER_B_SESSION || "",
  owner: process.env.VEDOY_TEST_OWNER_SESSION || "",
  draft: process.env.VEDOY_TEST_DRAFT_ID || "",
  title: process.env.VEDOY_TEST_DRAFT_TITLE || "",
};
const ready = Boolean(allowedHost && Object.values(credentials).every(Boolean));

async function withIdentity(browser, token) {
  const context = await browser.newContext({ baseURL: base });
  await context.addCookies([{
    name: "vedoy_studio_session",
    value: token,
    url: base,
    httpOnly: true,
    secure: new URL(base).protocol === "https:",
    sameSite: "Lax",
  }]);
  return context;
}

test.describe("Vedoy Studio — ekte kundereiser i preview", () => {
  test.skip(!ready, "Krever isolert preview og syntetiske testkontoer/grants. Aldri production.");

  test("1: Gjest omdirigeres til innlogging", async ({ page }) => {
    await page.goto("/studio/projects");
    await expect(page).toHaveURL(/\/login/);
  });

  test("2: Kunde A ser kun tildelte utkast, med tydelig status", async ({ browser }, testInfo) => {
    const context = await withIdentity(browser, credentials.a);
    try {
      const page = await context.newPage();
      await page.goto("/studio/projects");
      await expect(page.getByRole("heading", { name: /mine prosjekter/i })).toBeVisible();
      await expect(page.getByRole("heading", { name: credentials.title, exact: true })).toBeVisible();
      await expect(page.getByText("IKKE PUBLISERT").first()).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath("01-kunde-prosjekter-desktop.png"), fullPage: true });
      await expect(page.getByRole("button", { name: /opprett prosjekt|nytt prosjekt/i })).toHaveCount(0);
    } finally {
      await context.close();
    }
  });

  test("3: Kunde A åpner et privat utkast via prosjektlisten", async ({ browser }, testInfo) => {
    const context = await withIdentity(browser, credentials.a);
    try {
      const page = await context.newPage();
      await page.goto("/studio/projects");
      await page.getByRole("link", { name: "Åpne forhåndsvisning" }).first().click();
      await expect(page).toHaveURL(new RegExp("/studio/previews/" + credentials.draft + "$"));
      await expect(page.getByText(/Privat forhåndsvisning · IKKE PUBLISERT/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /publiser/i })).toHaveCount(0);
      await page.screenshot({ path: testInfo.outputPath("02-kunde-privat-utkast.png"), fullPage: true });
    } finally {
      await context.close();
    }
  });

  test("4: Kunde B får verken oversikt over eller direkte tilgang til kunde A sitt utkast", async ({ browser }) => {
    const context = await withIdentity(browser, credentials.b);
    try {
      const page = await context.newPage();
      await page.goto("/studio/projects");
      await expect(page.getByRole("heading", { name: credentials.title, exact: true })).toHaveCount(0);
      const response = await page.goto("/studio/previews/" + encodeURIComponent(credentials.draft));
      expect(response?.status()).toBe(404);
    } finally {
      await context.close();
    }
  });

  test("5: Kunde A får ikke bruke intern prosjekt-API", async ({ browser }) => {
    const context = await withIdentity(browser, credentials.a);
    try {
      const response = await context.request.get("/api/projects");
      expect(response.status()).toBe(403);
    } finally {
      await context.close();
    }
  });

  test("6: Kunde A får ikke manipulere utkast-tilganger", async ({ browser }) => {
    const context = await withIdentity(browser, credentials.a);
    try {
      const response = await context.request.post("/api/builder/preview-access", {
        data: { pageId: credentials.draft, email: "attacker@example.com", days: 7 },
        headers: { Origin: base },
      });
      expect(response.status()).toBe(403);
    } finally {
      await context.close();
    }
  });

  test("7: Admin kan ikke utføre prosjektendringer fra fremmed Origin", async ({ browser }) => {
    const context = await withIdentity(browser, credentials.owner);
    try {
      const response = await context.request.post("/api/projects", {
        data: { name: "IKKE SKAL LAGES" },
        headers: { Origin: "https://malicious-origin.invalid" },
      });
      expect(response.status()).toBe(403);
    } finally {
      await context.close();
    }
  });

  test("8: Mobilvisning er lesbar uten vannrett overflyt", async ({ browser }, testInfo) => {
    const context = await withIdentity(browser, credentials.a);
    try {
      const page = await context.newPage();
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/studio/projects");
      await expect(page.getByRole("heading", { name: /mine prosjekter/i })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      await page.screenshot({ path: testInfo.outputPath("03-kunde-prosjekter-mobil.png"), fullPage: true });
    } finally {
      await context.close();
    }
  });
});
