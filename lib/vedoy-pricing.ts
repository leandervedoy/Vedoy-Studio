import "server-only";

/**
 * Public, published Vedoy Pricing catalog. Never invent or silently fall back
 * to outdated rates. Read-only via the published-row RLS policy.
 */
export type VedoyPrice = {
  code: string;
  category: string;
  title: string;
  description: string;
  amount_ore: number;
  setup_ore: number;
  billing_period: string;
  currency: string;
  vat_mode: string;
  features: string[];
  featured: boolean;
  sort_order: number;
  updated_at: string;
};

const CATALOG_FIELDS = "code,category,title,description,amount_ore,setup_ore,billing_period,currency,vat_mode,features,featured,sort_order,updated_at";
const SUPPORTED_CATEGORIES = new Set(["studio", "growth", "assist", "campaign"]);

export async function getVedoyPrices(): Promise<VedoyPrice[]> {
  const endpoint = process.env.VEDOY_PRICING_SUPABASE_URL;
  const key = process.env.VEDOY_PRICING_SUPABASE_PUBLISHABLE_KEY;
  if (!endpoint || !key) {
    console.error("vedoy_pricing_unavailable: catalog configuration missing");
    return [];
  }
  try {
    const url = new URL("/rest/v1/vedoy_price_catalog", endpoint);
    url.searchParams.set("select", CATALOG_FIELDS);
    url.searchParams.set("published", "eq.true");
    url.searchParams.set("order", "category.asc,sort_order.asc");
    const response = await fetch(url, {
      headers: { apikey: key, "Accept": "application/json" },
      next: { revalidate: 60 },
    });
    if (!response.ok) throw new Error("Catalog responded " + response.status);
    const raw: unknown = await response.json();
    if (!Array.isArray(raw)) throw new Error("Catalog format invalid");
    return raw.flatMap((p): VedoyPrice[] => {
      if (!p || typeof p !== "object") return [];
      const item = p as Record<string, unknown>;
      if (typeof item.code !== "string" || typeof item.title !== "string" ||
          typeof item.category !== "string" || !SUPPORTED_CATEGORIES.has(item.category) ||
          !Number.isSafeInteger(item.amount_ore) || (item.amount_ore as number) < 0 ||
          !Number.isSafeInteger(item.setup_ore) || (item.setup_ore as number) < 0 ||
          item.currency !== "NOK") return [];
      return [{
        code: item.code,
        category: item.category,
        title: item.title,
        description: typeof item.description === "string" ? item.description : "",
        amount_ore: item.amount_ore as number,
        setup_ore: item.setup_ore as number,
        billing_period: typeof item.billing_period === "string" ? item.billing_period : "one_time",
        currency: "NOK",
        vat_mode: typeof item.vat_mode === "string" ? item.vat_mode : "excl",
        features: Array.isArray(item.features) ? item.features.filter((x): x is string => typeof x === "string") : [],
        featured: item.featured === true,
        sort_order: typeof item.sort_order === "number" ? item.sort_order : 100,
        updated_at: typeof item.updated_at === "string" ? item.updated_at : "",
      }];
    });
  } catch (error) {
    console.error("vedoy_pricing_unavailable", error instanceof Error ? error.message : "unknown");
    return [];
  }
}

export function priceAmount(ore: number): string {
  return new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 2 }).format(ore / 100) + " kr";
}

export function billingLabel(period: string): string {
  switch (period) {
    case "month": return "/mnd";
    case "year": return "/år";
    case "hour": return "/time";
    default: return "engangspris";
  }
}

export function vatLabel(mode: string): string {
  if (mode === "incl") return "inkl. mva.";
  if (mode === "not_applicable") return "mva. ikke aktuelt";
  return "ekskl. eventuell mva.";
}

export function formatCatalogPrice(price: VedoyPrice): string {
  return priceAmount(price.amount_ore) + (price.billing_period === "one_time" ? "" : billingLabel(price.billing_period));
}

export function selectPrices(prices: VedoyPrice[], category: VedoyPrice["category"]): VedoyPrice[] {
  return prices.filter((item) => item.category === category)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getPriceByCode(prices: VedoyPrice[], code: string): VedoyPrice | undefined {
  return prices.find((item) => item.code === code);
}
