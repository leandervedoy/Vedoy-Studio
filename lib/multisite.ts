import type { CatalogPrice } from "@/lib/vedoy-catalog";

/**
 * Single source for the Multisite sales flow. Industry ids match the existing
 * Multisite Experience (?tema=<id>). No monetary amounts are stored here.
 */
export const MULTISITE_SECTORS = [
  { id: "commerce", name: "Nettbutikk", icon: "🛍️", heading: "Produkter kundene vil oppdage", description: "Vis frem produkter, kolleksjoner og kjøpsmuligheter." },
  { id: "music", name: "Artist og musikk", icon: "🎵", heading: "Musikken din fortjener en egen scene", description: "Del utgivelser, arrangementer og merch." },
  { id: "art", name: "Kunstner og galleri", icon: "🎨", heading: "Kunsten fortjener å bli sett", description: "Presenter verk, utstillinger og kunstnerhistorier." },
  { id: "collective", name: "Klesmerke", icon: "👕", heading: "Din neste kolleksjon starter her", description: "Vis frem kolleksjoner og kreative kampanjer." },
  { id: "services", name: "Tjenestebedrift", icon: "🔧", heading: "Enklere å finne, velge og bestille deg", description: "Vis tjenester, referanser og kontaktmuligheter." },
  { id: "studio", name: "Frilanser og konsulent", icon: "✨", heading: "La arbeidet ditt snakke for seg", description: "Bygg tillit med prosjekter og kompetanse." },
  { id: "photo", name: "Fotograf", icon: "📷", heading: "Gjør bildene til hovedpersonen", description: "Vis porteføljen og gjør det lett å ta kontakt." },
  { id: "games", name: "Spill og teknologi", icon: "🎮", heading: "Vis frem det du bygger", description: "Presenter spill, demoer og siste nytt." },
  { id: "actor", name: "Skuespiller", icon: "🎭", heading: "Din profesjonelle portefølje", description: "Samle showreel, roller og kontakt." },
  { id: "football", name: "Idrettslag", icon: "⚽", heading: "Ett sted for hele laget", description: "Samle kamper, nyheter og sponsorer." },
  { id: "sewing", name: "Forening og fritidsklubb", icon: "🧵", heading: "Et digitalt møtested", description: "Del aktiviteter, bilder og arrangementer." },
  { id: "association", name: "Organisasjon", icon: "🤝", heading: "Samle mennesker rundt formålet", description: "Gjør det lett å bidra, delta og holde kontakten." }
] as const;

export const MULTISITE_FEATURES = [
  { id: "booking", title: "Booking og timebestilling", description: "Forespørsler og timevalg fra nettsiden.", priceCode: "multisite-booking", icon: "📅" },
  { id: "shop", title: "Nettbutikk", description: "Produktoversikt, handlekurv og betaling.", priceCode: "multisite-shop", icon: "🛒" },
  { id: "events", title: "Arrangementer og påmelding", description: "Kalender, billetter eller registrering.", priceCode: "multisite-events", icon: "🎟️" },
  { id: "members", title: "Medlemsområde", description: "Medlemsinnhold og tilgangsstyring.", priceCode: "multisite-members", icon: "👥" },
  { id: "gallery", title: "Galleri og portefølje", description: "Prosjekter, bilder og referanser.", priceCode: "multisite-gallery", icon: "🖼️" },
  { id: "menu", title: "Meny og bestilling", description: "Menyoversikt og bestillingsflyt.", priceCode: "multisite-menu", icon: "🍽️" },
  { id: "multilang", title: "Flere språk", description: "Presenter tjenestene på flere språk.", priceCode: "multisite-multilang", icon: "🌍" },
  { id: "integrations", title: "Integrasjoner", description: "Koble nettsiden mot eksisterende systemer.", priceCode: "multisite-integrations", icon: "🔌" }
] as const;

export type MultisiteSectorId = (typeof MULTISITE_SECTORS)[number]["id"];
export type MultisiteFeatureId = (typeof MULTISITE_FEATURES)[number]["id"];
export type MultisiteAddonCode = "" | "sikkerhet" | "totalpartner";
export const MULTISITE_MAIN_PLAN = "nettside-drift" as const;
export const MULTISITE_ADDON_CODES = ["sikkerhet", "totalpartner"] as const;

export type MultisitePriceLine = {
  code: string;
  title: string;
  description: string;
  amountOre: number;
  setupOre: number;
  billingPeriod: CatalogPrice["billingPeriod"];
  currency: CatalogPrice["currency"];
  vatMode: CatalogPrice["vatMode"];
  version: number;
  updatedAt?: string;
};

export type MultisiteQuote = {
  lines: MultisitePriceLine[];
  custom: { id: MultisiteFeatureId; title: string }[];
  monthlyOre: number;
  oneTimeOre: number;
  setupOre: number;
  currency: "NOK";
  vatMode: "excl" | "incl" | "not_applicable" | "mixed";
  requiresIndividualOffer: boolean;
  versions: { code: string; version: number }[];
  note: string;
};

const safePrice = (price: CatalogPrice | undefined, code: string): MultisitePriceLine => {
  if (!price || price.code !== code || price.currency !== "NOK" ||
      !Number.isSafeInteger(price.amountOre) || price.amountOre < 0 ||
      !Number.isSafeInteger(price.setupOre) || price.setupOre < 0 ||
      !Number.isSafeInteger(price.version) || price.version < 1 ||
      !["month", "one_time", "hour"].includes(price.billingPeriod) ||
      !["excl", "incl", "not_applicable"].includes(price.vatMode)) {
    throw new Error("MISSING_OR_INVALID_PRICE");
  }
  return {
    code: price.code, title: price.title, description: price.description,
    amountOre: price.amountOre, setupOre: price.setupOre, billingPeriod: price.billingPeriod,
    currency: price.currency, vatMode: price.vatMode, version: price.version,
    updatedAt: price.updatedAt
  };
};

export function calculateMultisiteQuote(
  publishedPrices: CatalogPrice[],
  featureIds: readonly string[],
  addonCode: string = ""
): MultisiteQuote {
  if (!Array.isArray(publishedPrices) || !Array.isArray(featureIds) ||
      featureIds.length > MULTISITE_FEATURES.length ||
      new Set(featureIds).size !== featureIds.length ||
      featureIds.some(id => !MULTISITE_FEATURES.some(f => f.id === id)) ||
      (addonCode !== "" && !MULTISITE_ADDON_CODES.some(code => code === addonCode))) {
    throw new Error("INVALID_SELECTION");
  }

  const byCode = new Map(publishedPrices.map(price => [price.code, price]));
  const main = safePrice(byCode.get(MULTISITE_MAIN_PLAN), MULTISITE_MAIN_PLAN);
  if (main.billingPeriod !== "month") throw new Error("INVALID_PLAN_PERIOD");

  const lines = [main];
  if (addonCode) lines.push(safePrice(byCode.get(addonCode), addonCode));

  const custom: MultisiteQuote["custom"] = [];
  for (const id of featureIds) {
    const feature = MULTISITE_FEATURES.find(f => f.id === id);
    if (!feature) throw new Error("INVALID_SELECTION");
    const catalogItem = byCode.get(feature.priceCode);
    if (catalogItem) lines.push(safePrice(catalogItem, feature.priceCode));
    else custom.push({ id: feature.id, title: feature.title });
  }
  if (lines.some(line => line.billingPeriod === "hour")) {
    // An hourly rate cannot be summed into a subscription estimate.
    throw new Error("UNSUPPORTED_PRICING_PERIOD");
  }
  const sum = (items: number[]) => {
    const total = items.reduce((acc, value) => acc + value, 0);
    if (!Number.isSafeInteger(total)) throw new Error("INVALID_PRICE_TOTAL");
    return total;
  };
  const vatModes = [...new Set(lines.map(line => line.vatMode))];
  const vatMode = vatModes.length === 1 ? vatModes[0] : "mixed";
  return {
    lines,
    custom,
    monthlyOre: sum(lines.filter(line => line.billingPeriod === "month").map(line => line.amountOre)),
    oneTimeOre: sum(lines.filter(line => line.billingPeriod === "one_time").map(line => line.amountOre)),
    setupOre: sum(lines.map(line => line.setupOre)),
    currency: "NOK",
    vatMode,
    requiresIndividualOffer: custom.length > 0,
    versions: lines.map(line => ({ code: line.code, version: line.version })),
    note: "Uforpliktende prisoversikt fra publiserte Vedøy-priser. Tilpasninger uten katalogpris prises individuelt. Ingen bestilling eller avtale opprettes."
  };
}

export function multisiteMoney(ore: number): string {
  return new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 2 }).format(ore / 100) + " kr";
}
