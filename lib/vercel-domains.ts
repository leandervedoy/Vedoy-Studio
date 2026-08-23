import "server-only";
import type { DomainSearchResult } from "@/lib/types";

const DEFAULT_TLDS = ["no", "com", "net", "app"];
const DOMAIN_PATTERN = /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

type DomainQuote = DomainSearchResult & {
  providerPrice: number;
  providerCurrency: string;
};

function providerUrl(path: string) {
  const teamId = process.env.VERCEL_REGISTRAR_TEAM_ID;
  const separator = path.includes("?") ? "&" : "?";
  return `https://api.vercel.com${path}${teamId ? `${separator}teamId=${encodeURIComponent(teamId)}` : ""}`;
}

function providerHeaders() {
  const token = process.env.VERCEL_REGISTRAR_TOKEN;
  if (!token) throw new Error("DOMAIN_PROVIDER_NOT_CONFIGURED");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export function isDomainProviderConfigured() {
  return Boolean(process.env.VERCEL_REGISTRAR_TOKEN);
}

export function normalizeDomain(value: string) {
  return value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].replace(/[^a-z0-9.-]/g, "").replace(/\.{2,}/g, ".");
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
}

function readProviderPrice(data: Record<string, unknown>): number {
  const direct = readNumber(data.price) ?? readNumber(data.purchasePrice);
  if (direct !== undefined) return direct;
  const purchase = data.purchase;
  if (purchase && typeof purchase === "object") {
    const nested = readNumber((purchase as Record<string, unknown>).price) ?? readNumber((purchase as Record<string, unknown>).value);
    if (nested !== undefined) return nested;
  }
  throw new Error("Domenetilbyderen returnerte ingen kjøpspris.");
}

function nokResalePrice(providerPrice: number) {
  const usdNok = Number(process.env.DOMAIN_USD_NOK_RATE || "12");
  return Math.ceil((providerPrice * usdNok + 199) / 10) * 10;
}

export async function getDomainQuote(domainInput: string): Promise<DomainQuote> {
  const domain = normalizeDomain(domainInput);
  if (!DOMAIN_PATTERN.test(domain)) throw new Error("Ugyldig domenenavn.");

  const headers = providerHeaders();
  const encoded = encodeURIComponent(domain);
  const [availabilityResponse, priceResponse] = await Promise.all([
    fetch(providerUrl(`/v1/registrar/domains/${encoded}/availability`), { headers, cache: "no-store" }),
    fetch(providerUrl(`/v1/registrar/domains/${encoded}/price`), { headers, cache: "no-store" })
  ]);

  const availabilityData = await availabilityResponse.json() as Record<string, unknown> & { error?: { message?: string } };
  const priceData = await priceResponse.json() as Record<string, unknown> & { error?: { message?: string } };
  if (!availabilityResponse.ok) throw new Error(availabilityData.error?.message || "Kunne ikke kontrollere domenet.");
  if (!priceResponse.ok) throw new Error(priceData.error?.message || "Kunne ikke hente domenepris.");

  const available = availabilityData.available === true || availabilityData.availability === "available";
  const providerPrice = readProviderPrice(priceData);
  const providerCurrency = typeof priceData.currency === "string" ? priceData.currency.toUpperCase() : "USD";
  const annualPriceNok = nokResalePrice(providerPrice);

  return { domain, available, annualPriceNok, renewalPriceNok: annualPriceNok, premium: Boolean(priceData.premium), providerPrice, providerCurrency };
}

export async function searchDomains(query: string): Promise<DomainQuote[]> {
  if (!isDomainProviderConfigured()) throw new Error("DOMAIN_PROVIDER_NOT_CONFIGURED");

  const normalized = normalizeDomain(query);
  const labels = normalized.split(".");
  const hasTld = labels.length > 1;
  const name = (hasTld ? labels.slice(0, -1).join("") : labels[0]).replace(/^-+|-+$/g, "");
  if (name.length < 2) throw new Error("Skriv minst to tegn.");
  const candidates = hasTld ? [normalized, ...DEFAULT_TLDS.filter((tld) => tld !== labels.at(-1)).slice(0, 3).map((tld) => `${name}.${tld}`)] : DEFAULT_TLDS.map((tld) => `${name}.${tld}`);
  const settled = await Promise.allSettled([...new Set(candidates)].map(getDomainQuote));
  const results = settled.flatMap((entry) => entry.status === "fulfilled" ? [entry.value] : []);
  if (!results.length) throw new Error("Ingen av domenene kunne kontrolleres hos leverandøren.");
  return results;
}

export type RegistrantContact = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  address1: string;
  city: string;
  postalCode: string;
  state?: string;
  orgName?: string;
};

export async function purchaseDomain(domainInput: string, contact: RegistrantContact) {
  const quote = await getDomainQuote(domainInput);
  if (!quote.available) throw new Error("Domenet er ikke lenger tilgjengelig.");
  const response = await fetch(providerUrl(`/v1/registrar/domains/${encodeURIComponent(quote.domain)}/buy`), {
    method: "POST",
    headers: providerHeaders(),
    body: JSON.stringify({ expectedPrice: quote.providerPrice, renew: true, ...contact })
  });
  const data = await response.json() as Record<string, unknown> & { error?: { message?: string; code?: string } };
  if (!response.ok) throw new Error(data.error?.message || "Domenekjøpet kunne ikke fullføres.");
  return data;
}
