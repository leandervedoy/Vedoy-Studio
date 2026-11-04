export interface PublishedPrice {
  code: string;
  title: string;
  amountOre: number;
  setupOre: number;
  billingPeriod: "month" | "hour" | "one_time";
  currency: "NOK";
  vatMode: "excl" | "incl" | "not_applicable";
  version: number;
}
export interface PricingInquiry {
  planCode: string;
  addonCode?: string;
}
export function resolvePricingInquiry(input: PricingInquiry, publishedPrices: PublishedPrice[]): {
  main: PublishedPrice;
  addon: PublishedPrice | null;
  summary: string;
};
