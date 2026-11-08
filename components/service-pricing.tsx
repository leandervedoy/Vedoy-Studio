import Link from "next/link";
import { listPublishedPrices, money, type CatalogPrice } from "@/lib/vedoy-catalog";

type PricingType = "website" | "webapp" | "store" | "general" | "clothing";

const context: Record<PricingType, { subject: string; description: string; need: string }> = {
  website: { subject: "nettsiden", description: "Antall sider, innhold, språk og integrasjoner avgjør hva utviklingsarbeidet koster. Abonnementene nedenfor er publisert av Vedoy Pricing.", need: "Nettside" },
  webapp: { subject: "webappen", description: "Roller, database, sikkerhet og API-er avgjør prosjektprisen. Vi gir deg et skriftlig tilbud etter behovsavklaring.", need: "Webapp" },
  store: { subject: "nettbutikken", description: "Produkter, betalingsløsninger, frakt, plattform og integrasjoner avgjør prosjektprisen.", need: "Nettbutikk" },
  general: { subject: "tjenesten", description: "Velg en publisert bedriftsavtale, eller få et individuelt tilbud for arbeidet du trenger.", need: "Prosjektprat" },
  clothing: { subject: "profilproduktene", description: "Trykk, antall, materialer og leverandør påvirker prisen. Endelig pris bekreftes før bestilling.", need: "Profilprodukter" },
};

const period = (value: CatalogPrice["billingPeriod"]) =>
  value === "month" ? "/mnd" : value === "hour" ? "/time" : "engangspris";
const vat = (value: CatalogPrice["vatMode"]) =>
  value === "incl" ? "inkl. mva." : value === "excl" ? "ekskl. eventuell mva." : "mva. ikke aktuelt";

export async function ServicePricing({ type }: { type: PricingType }) {
  let studio: CatalogPrice[] = [];
  let growth: CatalogPrice[] = [];
  try {
    [studio, growth] = await Promise.all([listPublishedPrices("studio"), listPublishedPrices("growth")]);
  } catch (error) {
    console.warn("Vedoy Pricing unavailable on service page", error instanceof Error ? error.message : "unknown");
  }

  const c = context[type];
  const highlighted = type === "website" ? studio.filter(plan => plan.code === "nettside-drift")
    : type === "general" ? studio : [];
  return <section className="website-pricing" id="priser">
    <div className="website-pricing__heading">
      <div><p className="editorial-kicker lime">VEDØY PRICING · PUBLISERTE PRISER</p><h2>Trygghet<br /><em>fra starten.</em></h2></div>
      <div><strong>Prosjektpris og abonnement er forskjellige ting.</strong><p>{c.description}</p></div>
    </div>
    {highlighted.length ? <div className="website-pricing__cards">{highlighted.map(plan =>
      <article key={plan.code} className={plan.featured ? "is-featured" : undefined}>
        {plan.featured ? <span>ANBEFALT</span> : null}
        <small>VEDØY PRICING</small>
        <h3>{plan.title}</h3>
        <strong>{money(plan.amountOre)} {period(plan.billingPeriod)}</strong>
        <p>{vat(plan.vatMode)}</p>
        {plan.setupOre > 0 ? <p>Oppsett: {money(plan.setupOre)}</p> : null}
        <p>{plan.description}</p>
        <ul>{plan.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
      </article>)}</div> : <p>Ingen publisert fast prosjektpris for {c.subject}. Vi avklarer omfanget og sender et uforpliktende tilbud.</p>}
    <div className="website-pricing__notice"><strong>Klare rammer før du bestemmer deg</strong><p>Priser på publiserte produkter hentes fra Vedøy Developer Portal / Vedoy Pricing. Eventuelle leverandørkostnader, domene, ekstrautvikling og MVA avklares før avtale. For skreddersøm tilbyr vi individuell prosjektpris.</p></div>
    <div className="service-pricing-actions"><Link href="/pricing#kalkulator" className="editorial-button">Finn riktig pris <span aria-hidden="true">↗</span></Link><Link href={"/?need=" + encodeURIComponent(c.need) + "&source=service-pricing#kontakt"} className="editorial-outline">Få konkret tilbud</Link></div>
    <section className="business-subscriptions">
      <div className="business-subscriptions__heading"><div><p className="editorial-kicker lime">VEDØY GROWTH</p><h2>Drift og<br /><em>oppfølging.</em></h2></div><p>Vedøy Growth kan kombineres med nettsider og utvikling. Her er publiserte Growth-planer.</p></div>
      <div className="business-subscriptions__grid">
        {growth.map(plan => <article key={plan.code} className={plan.featured ? "is-featured" : undefined}><small>GROWTH-ABONNEMENT</small>
          <h3>{plan.title}</h3><strong>{money(plan.amountOre)} {period(plan.billingPeriod)}</strong><p>{plan.description} · {vat(plan.vatMode)}</p>
          <ul>{plan.features.map(feature => <li key={feature}>{feature}</li>)}</ul></article>)}
        {!growth.length ? <p>Prisene er midlertidig utilgjengelige. <Link href="/pricing">Se prissiden</Link>.</p> : null}
      </div>
      <Link href="/pricing#growth-priser" className="editorial-button">Sammenlign Growth-planer <span aria-hidden="true">↗</span></Link>
    </section>
  </section>;
}
