import type { DomainSearchResult } from "@/lib/types";

const prices: Record<string, number> = {
  no: 129,
  com: 159,
  net: 179,
  io: 499,
  app: 249,
  studio: 399,
  dev: 189
};

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .replace(/[^a-z0-9æøå.-]/g, "")
    .replace(/\.{2,}/g, ".");
}

function deterministicAvailability(domain: string): boolean {
  const occupied = ["google.com", "facebook.com", "vedoy.com", "shopify.com", "vercel.com"];
  if (occupied.includes(domain)) return false;
  const score = [...domain].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return score % 5 !== 0;
}

export function searchDomains(query: string): DomainSearchResult[] {
  const normalized = normalize(query);
  const [rawName, providedTld] = normalized.includes(".")
    ? [normalized.split(".").slice(0, -1).join(""), normalized.split(".").at(-1)]
    : [normalized, undefined];
  const name = rawName || "minbedrift";
  const tlds = providedTld ? [providedTld, "no", "com", "app"] : ["no", "com", "app", "studio", "io"];

  return [...new Set(tlds)].slice(0, 5).map((tld) => {
    const domain = `${name}.${tld}`;
    const base = prices[tld] ?? 199;
    const premium = name.length <= 4 || ["ai", "app", "web", "studio"].includes(name);
    return {
      domain,
      available: deterministicAvailability(domain),
      annualPriceNok: premium ? base * 3 : base,
      renewalPriceNok: base,
      premium
    };
  });
}
