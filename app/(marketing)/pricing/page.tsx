import type { Metadata } from "next";
import Link from "next/link";
import { getVedoyPrices, selectPrices, getPriceByCode, formatCatalogPrice, priceAmount, vatLabel } from "@/lib/vedoy-pricing";

export const metadata: Metadata = {
  title: "Priser på nettside, drift og Vedøy Growth",
  description: "Se publiserte Vedøy-priser for nettside og drift, IT-hjelp og Vedøy Growth. Uforpliktende prosjektprat for løsninger med individuelt omfang.",
};

export const dynamic = "force-dynamic";

function priceAction(code: string, category: string): { title: string; href: string } {
  const match: Record<string, string> = {
    "growth-start": "start",
    "growth-team": "team",
    "growth-plus": "plus",
  };
  if (category === "growth" && match[code]) {
    return { title: "Velg " + code.replace("growth-", ""), href: "/start-bedrift?plan=" + match[code] + "&source=pricing" };
  }
  return { title: "Be om tilbud", href: "/?need=" + encodeURIComponent(category === "growth" ? "Vedøy Growth" : category === "assist" ? "IT-hjelp" : "Nettside") + "&source=pricing#kontakt" };
}

export default async function PricingPage() {
  const prices = await getVedoyPrices();
  const studio = selectPrices(prices, "studio");
  const growth = selectPrices(prices, "growth");
  const assist = selectPrices(prices, "assist");
  const campaign = getPriceByCode(prices, "growth-pilot");
  return (
    <section className="pricing-page">
      <div className="container">
        <header className="section-heading">
          <p className="eyebrow">VEDØY PRICING · OPPDATERTE PRISER</p>
          <h1>En tydelig pris. Et tydelig neste steg.</h1>
          <p>Alle beløp under hentes fra Vedoy Pricing. Abonnement, prosjektutvikling og engangshjelp er forskjellige tjenester. Et spesifisert tilbud avklarer leveransen før noe blir bindende.</p>
          <Link href="/?need=Prosjektprat&source=pricing#kontakt" className="button button--dark">Be om gratis prosjektprat ↗</Link>
        </header>

        {campaign ? (
          <article className="pricing-launch-offer">
            <div>
              <p className="eyebrow">PILOTPROGRAM · ETTER GODKJENNING</p>
              <h2>{campaign.title}</h2>
              <p>{campaign.description}</p>
              <p><strong>{formatCatalogPrice(campaign)}</strong> · {vatLabel(campaign.vat_mode)}. Tilgjengelighet og videre pris bekreftes individuelt.</p>
            </div>
            <Link href="/pricing/startpakke" className="button button--light">Se piloten <span aria-hidden="true">↗</span></Link>
          </article>
        ) : null}

        <section aria-labelledby="studio-priser">
          <header className="section-heading"><h2 id="studio-priser">Nettside, drift og IT-avtaler</h2><p>Vedøy Studio-abonnementer. Egenutvikling og spesielle integrasjoner prises separat dersom de ikke er inkludert i avtalen.</p></header>
          <div className="pricing-grid">
            {studio.map((plan) => {
              const action = priceAction(plan.code, plan.category);
              return <article className={plan.featured ? "pricing-card is-popular" : "pricing-card"} key={plan.code}>
                {plan.featured ? <span className="popular-label">ANBEFALT</span> : null}
                <h3>{plan.title}</h3><p>{plan.description}</p>
                <div className="price"><strong>{priceAmount(plan.amount_ore)}</strong><span>{plan.billing_period === "month" ? "per måned" : plan.billing_period === "one_time" ? "engangspris" : plan.billing_period === "year" ? "per år" : "per time"}</span></div>
                <p>{vatLabel(plan.vat_mode)}</p>
                {plan.setup_ore > 0 ? <p>Oppsett: {priceAmount(plan.setup_ore)}</p> : null}
                <ul>{plan.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
                <Link className={plan.featured ? "button button--dark button--wide" : "button button--ghost button--wide"} href={action.href}>{action.title} ↗</Link>
              </article>;
            })}
          </div>
          {!studio.length ? <p role="status">Gjeldende bedriftspriser er midlertidig utilgjengelige. Be om et spesifisert tilbud.</p> : null}
        </section>

        <section className="pricing-growth-access" id="vedoy-growth">
          <header><p className="eyebrow">VEDØY GROWTH · PROGRAMVARE</p><h2>Et arbeidsområde som vokser med bedriften.</h2><p>Dette er prisene for Growth-plattformen, ikke timepakker for IT-hjelp. Registrering gjennomgås før tilgang aktiveres. Betaling starter ikke automatisk.</p><Link href="/start-bedrift?plan=trial&source=pricing">Søk om gratis prøveperiode ↗</Link></header>
          <div>
            {growth.map(plan => {
              const action = priceAction(plan.code, plan.category);
              return <article key={plan.code} className={plan.featured ? "is-featured" : ""}>
                <small>{plan.featured ? "FOR SMÅ TEAM" : "GROWTH"}</small>
                <h3>{plan.title}</h3>
                <strong>{formatCatalogPrice(plan)}</strong>
                <span>{vatLabel(plan.vat_mode)}</span>
                <p>{plan.description}</p>
                <ul>{plan.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
                <Link href={action.href}>{action.title} ↗</Link>
              </article>;
            })}
          </div>
          {!growth.length ? <p role="status">Growth-prisene kunne ikke lastes. Du kan sende en uforpliktende forespørsel.</p> : null}
        </section>

        <section className="pricing-examples">
          <div><p className="eyebrow">ENGANGS-IT-HJELP</p><h2>Hjelp når du trenger det.</h2><p>Engangstjenester fra Vedoy Pricing. Omfang og eventuell reisetid avklares før bestilling.</p></div>
          <ul>{assist.map(plan => <li key={plan.code}><strong>{plan.title}</strong><span>{formatCatalogPrice(plan)} · {vatLabel(plan.vat_mode)}</span></li>)}</ul>
        </section>
        <div className="pricing-note">
          <strong>Nettside eller nettbutikk med eget omfang?</strong>
          <p>Ta kontakt for prosjektpris. Vi finner først ut hva bedriften trenger, og gir deg et konkret tilbud. Vi lover ikke en pris som ikke finnes i Vedoy Pricing.</p>
          <Link href="/?need=Prosjektprat&source=pricing#kontakt">Be om gratis prosjektprat ↗</Link>
        </div>
      </div>
    </section>
  );
}
