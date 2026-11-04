/** Shared, dependency-free Vedøy Pricing → Studio CRM contract. */
const CODE = /^[a-z0-9][a-z0-9_-]{1,69}$/;
const kroner = (ore) => `${new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 2 }).format(ore / 100)} kr`;

export function resolvePricingInquiry(input, publishedPrices) {
  if (!Array.isArray(publishedPrices)) throw new Error("CATALOG_UNAVAILABLE");
  const code = String(input?.planCode ?? "");
  const addonCode = input?.addonCode ? String(input.addonCode) : null;
  if (!CODE.test(code) || (addonCode && !CODE.test(addonCode))) throw new Error("INVALID_PLAN");
  if (addonCode && code === addonCode) throw new Error("DUPLICATE_PLAN");
  const find = value => publishedPrices.find(price => price?.code === value);
  const main = find(code);
  const addon = addonCode ? find(addonCode) : null;
  if (!main || (addonCode && !addon)) throw new Error("UNKNOWN_PLAN");
  const plans = [main, ...(addon ? [addon] : [])];
  for (const plan of plans) {
    if (plan.currency !== "NOK" || !Number.isSafeInteger(plan.amountOre) || plan.amountOre < 0 || !Number.isSafeInteger(plan.setupOre) || plan.setupOre < 0) {
      throw new Error("INVALID_CATALOG_PRICE");
    }
  }
  const line = p => `${p.title} (${p.code}): ${kroner(p.amountOre)} ${p.billingPeriod === "month" ? "per måned" : p.billingPeriod === "hour" ? "per time" : "engangsbeløp"}; etablering ${kroner(p.setupOre)}; mva ${p.vatMode || "uavklart"}; Versjon: ${p.version}`;
  return {
    main,
    addon,
    summary: ["Kilde: Vedøy Pricing via Vedøy Developer Portal (serververifisert)", ...plans.map(line), "Dette er en uforpliktende forespørsel, ikke en bestilling."].join("\n")
  };
}
