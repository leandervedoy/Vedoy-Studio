import Link from "next/link";
import { getVedoyPrices, getPriceByCode, selectPrices, formatCatalogPrice, priceAmount, vatLabel } from "@/lib/vedoy-pricing";

type PricingType = "website" | "webapp" | "store" | "general" | "clothing";

const context: Record<PricingType, { subject: string; description: string; need: string }> = {
  website: { subject: "nettsiden", description: "Antall sider, innhold, språk og integrasjoner avgjør hva utviklingsarbeidet koster. Abonnementet nedenfor er en publisert Vedøy-pakke.", need: "Nettside" },
  webapp: { subject: "webappen", description: "Omfang, roller, database, API-er og sikkerhet avgjør prosjektprisen. Vi lager et skriftlig tilbud etter behovsavklaring.", need: "Webapp" },
  store: { subject: "nettbutikken", description: "Produkter, betalingsløsninger, frakt, plattform og integrasjoner avgjør prosjektprisen. Vi gir deg et konkret tilbud.", need: "Nettbutikk" },
  general: { subject: "tjenesten", description: "Velg en publisert bedriftsavtale eller få et individuelt tilbud på arbeidet du trenger.", need: "Prosjektprat" },
  clothing: { subject: "profilproduktene", description: "Trykk, antall, materialer og leverandør påvirker produksjonsprisen. Endelig pris bekreftes før bestilling.", need: "Profilprodukter" },
};

export async function ServicePricing({ type }: { type: PricingType }) {
  const all = await getVedoyPrices();
  const config = context[type];
  const relevant = type === "website"
    ? [getPriceByCode(all, "nettside-drift")].filter((x): x is NonNullable<typeof x> => Boolean(x))
    : type === "general" ? selectPrices(all, "studio") : [];
  return <section className="website-pricing" id="priser">
    <div className="website-pricing__heading">
      <div><p className="editorial-kicker lime">VEDOY PRICING · PUBLISERTE PRISER</p><h2>Forutsigbarhet<br /><em>fra starten.</em></h2></div>
      <div><strong>Vi skiller abonnementspris og prosjektpris.</strong><p>{config.description}</p></div>
    </div>
    {relevant.length ? <div className="website-pricing__cards">{relevant.map(plan =>
      <article key={plan.code} className={plan.featured ? "is-featured" : undefined}>
        {plan.featured ? <span>ANBEFALT</span> : null}<small>VEDØY PRICING</small>
        <h3>{plan.title}</h3><strong>{formatCatalogPrice(plan)}</strong><p>{vatLabel(plan.vat_mode)}</p>
        {plan.setup_ore > 0 ? <p>Oppsett: {priceAmount(plan.setup_ore)}</p> : null}
        <p>{plan.description}</p><ul>{plan.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
      </article>)}</div> : <p>Ingen publisert fast prosjektpris for {config.subject}. Vi avklarer omfanget og sender et uforpliktende tilbud.</p>}
    <div className="website-pricing__notice">
      <strong>Ingen skjulte løfter om fastpris</strong>
      <p>Publiserte beløp hentes fra Vedoy Pricing. Leverandørkostnader, eventuelt domene, ekstrautvikling og MVA avklares før signering. Prosjektpris fastsettes individuelt der katalogen ikke angir beløp.</p>
    </div>
    <Link href={"/?need=" + encodeURIComponent(config.need) + "&source=service-pricing#kontakt"} className="editorial-button">Få konkret tilbud <span aria-hidden="true">↗</span></Link>
    <section className="business-subscriptions">
      <div className="business-subscriptions__heading">
        <div><p className="editorial-kicker lime">VEDØY GROWTH</p><h2>Drift og<br /><em>oppfølging.</em></h2></div>
        <p>Growth-programvare kan kombineres med utvikling og drift. Se oppdaterte planer fra Vedoy Pricing.</p>
      </div>
      <div className="business-subscriptions__grid">{selectPrices(all, "growth").map(plan => <article key={plan.code} className={plan.featured ? "is-featured" : undefined}>
        <small>GROWTH-ABONNEMENT</small><h3>{plan.title}</h3><strong>{formatCatalogPrice(plan)}</strong>
        <p>{plan.description} · {vatLabel(plan.vat_mode)}</p><ul>{plan.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
      </article>)}</div>
      <Link href="/pricing#vedoy-growth" className="editorial-button">Se Growth-planer <span aria-hidden="true">↗</span></Link>
    </section>
  </section>;
}
