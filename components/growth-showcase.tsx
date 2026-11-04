import Link from "next/link";
import { getVedoyPrices, selectPrices, formatCatalogPrice } from "@/lib/vedoy-pricing";

export async function GrowthShowcase() {
  const plans = selectPrices(await getVedoyPrices(), "growth");
  return <section className="growth-showcase" id="vedoy-growth">
    <div className="growth-showcase__intro">
      <div><p className="editorial-kicker lime">VEDØY GROWTH · ARBEIDSOMRÅDE FOR BEDRIFTER</p><h2>Se hele<br /><em>virksomheten.</em></h2></div>
      <div><p>Vedøy Growth samler kunder, prosjekter, booking, timer, notater og oppfølging. Velg moduler etter behov, og avklar tilgang før oppstart.</p>
        <div className="growth-showcase__actions"><Link href="/login?next=/studio" className="editorial-button">Åpne Growth <span aria-hidden="true">↗</span></Link><Link href="/start-bedrift?plan=trial&source=home" className="editorial-outline">Søk om prøveperiode</Link><Link href="/pricing#vedoy-growth" className="editorial-outline">Se priser</Link></div>
      </div>
    </div>
    <div className="growth-preview" aria-label="Illustrasjon av Vedøy Growth-styrebord">
      <div className="growth-preview__bar"><span>VØ</span><b>Vedøy Growth</b><small>ILLUSTRASJON · IKKE SANNTIDSDATA</small></div>
      <aside><strong>Oversikt</strong><span>Henvendelser</span><span>Prosjekter</span><span>Notater</span><span>Statistics</span></aside>
      <main><small>ARBEIDSFLATE</small><h3>Én plass for neste steg.</h3><p>Samle salgsmuligheter, kundeoppfølging og arbeidsoppgaver.</p></main>
    </div>
    <div className="growth-plans">{plans.map(plan => <article className={plan.featured ? "is-featured" : ""} key={plan.code}>
      <small>{plan.title}</small><h3>{formatCatalogPrice(plan)}</h3><p>{plan.description}</p>
      <ul>{plan.features.map(item => <li key={item}>✓ {item}</li>)}</ul>
      <Link href={"/pricing#vedoy-growth"}>Se plan <span aria-hidden="true">↗</span></Link>
    </article>)}</div>
    {!plans.length ? <p role="status">Priser er midlertidig utilgjengelige. Du kan fortsatt be om tilbud.</p> : null}
    <p className="growth-showcase__note">Prisene kommer fra Vedoy Pricing. Opprettelse og betalt tilgang bekreftes av Vedøy; ingen automatisk belastning skjer ved forespørsel.</p>
  </section>;
}
