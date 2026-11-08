import Link from "next/link";
import { listPublishedPrices, money, type CatalogPrice } from "@/lib/vedoy-catalog";

export async function GrowthShowcase() {
  let plans: CatalogPrice[] = [];
  try { plans = await listPublishedPrices("growth"); }
  catch (error) { console.warn("Growth catalog unavailable", error instanceof Error ? error.message : "unknown"); }
  return <section className="growth-showcase" id="vedoy-growth">
    <div className="growth-showcase__intro">
      <div><p className="editorial-kicker lime">VEDØY GROWTH · ARBEIDSOMRÅDE FOR BEDRIFTER</p><h2>Se hele<br /><em>virksomheten.</em></h2></div>
      <div><p>Vedøy Growth samler kunder, prosjekter, booking, timer og oppfølging. Velg tilgang etter hva bedriften trenger, og start med en uforpliktende forespørsel.</p>
        <div className="growth-showcase__actions"><Link href="/projects/growth" className="editorial-button">Se Growth <span aria-hidden="true">↗</span></Link><Link href="/start-bedrift?plan=trial&source=home" className="editorial-outline">Søk om prøveperiode</Link><Link href="/pricing#kalkulator" className="editorial-outline">Finn riktig pris</Link></div>
      </div>
    </div>
    <div className="growth-preview" aria-label="Illustrasjon av Vedøy Growth-styrebord">
      <div className="growth-preview__bar"><span>VØ</span><b>Vedøy Growth</b><small>ILLUSTRASJON · IKKE SANNTIDSDATA</small></div>
      <aside><strong>Oversikt</strong><span>Henvendelser</span><span>Prosjekter</span><span>Notater</span><span>Statistics</span></aside>
      <main><small>ARBEIDSFLATE</small><h3>Én plass for neste steg.</h3><p>Samle viktige oppgaver, kundeoppfølging og avtaler.</p></main>
    </div>
    <div className="growth-plans">
      {plans.map(plan => <article className={plan.featured ? "is-featured" : ""} key={plan.code}>
        <small>{plan.title}</small><h3>{money(plan.amountOre)}<span>/{plan.billingPeriod === "month" ? "mnd" : "time"}</span></h3>
        <p>{plan.description}</p><ul>{plan.features.map(item => <li key={item}>✓ {item}</li>)}</ul>
        <Link href="/pricing#growth-priser">Se plan <span aria-hidden="true">↗</span></Link>
      </article>)}
    </div>
    {!plans.length ? <p role="status">Priser er midlertidig utilgjengelige. Du kan fortsatt be om tilbud.</p> : null}
    <p className="growth-showcase__note">Prisene hentes fra Vedoy Pricing. Ingen abonnement eller betaling starter automatisk ved en forespørsel.</p>
  </section>;
}
