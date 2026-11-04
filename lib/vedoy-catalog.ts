/** Public read path: all website prices and copy come from Vedøy Developer Portal. */
export type CatalogPrice = {
  code: string; category: string; title: string; description: string;
  amountOre: number; setupOre: number; billingPeriod: "month" | "hour" | "one_time";
  currency: "NOK"; vatMode: "excl" | "incl" | "not_applicable";
  features: string[]; featured?: boolean; version: number; updatedAt?: string;
};
export type CatalogContent = { key: string; eyebrow: string; heading: string; body: string; version: number; updatedAt?: string };
const base = (process.env.VEDOY_DEVELOPER_API_BASE_URL || "https://vedoy-dev-portal.vercel.app/api").replace(/\/$/, "");
async function request<T>(path: string, field: string): Promise<T[]> {
  const response = await fetch(`${base}/v1/${path}`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`Vedoy Developer Portal catalog unavailable (${response.status})`);
  const result: Record<string, unknown> = await response.json();
  if (!Array.isArray(result[field])) throw new Error("Invalid Vedoy Developer Portal catalog response");
  return result[field] as T[];
}
export async function listPublishedPrices(category?: string): Promise<CatalogPrice[]> {
  const prices = await request<CatalogPrice>(`pricing${category ? `?category=${encodeURIComponent(category)}` : ""}`, "prices");
  if (prices.some(p => typeof p.code !== "string" || !Number.isSafeInteger(p.amountOre) || p.amountOre < 0 || !Array.isArray(p.features))) throw new Error("Invalid price data");
  return prices;
}
export async function listPublishedContent(): Promise<Record<string, CatalogContent>> {
  const contents = await request<CatalogContent>("site-content", "content");
  return Object.fromEntries(contents.filter(c => typeof c.key === "string").map(c => [c.key, c]));
}
export const money = (ore: number) => new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 2 }).format(ore / 100) + " kr";
