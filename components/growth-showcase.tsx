import Link from "next/link";

const plans = [
  { name: "Prøv Growth", price: "0 kr", detail: "7 dager", items: ["Alle Growth-appene", "Én bruker", "Ingen automatisk belastning"], action: "Start oppsett" },
  { name: "Growth Start", price: "29 kr", detail: "per måned", items: ["Notater og oppgaver", "Kunder og enkel CRM", "Én bruker"], action: "Velg Start" },
  { name: "Growth Team", price: "299 kr", detail: "per måned", items: ["Hele Vedøy Growth", "Booking, prosjekt og CRM", "Inntil 10 brukere"], action: "Velg Team", featured: true },
  { name: "Growth Plus", price: "699 kr", detail: "per måned", items: ["Alt i Team", "Prioritert IT-hjelp", "Inntil 25 brukere"], action: "Velg Plus" }
];

export function GrowthShowcase() {
  return <section className="growth-showcase" id="vedoy-growth">
    <div className="growth-showcase__intro"><div><p className="editorial-kicker lime">VEDØY GROWTH · ARBEIDSOMRÅDE FOR BEDRIFTER</p><h2>Se hele<br/><em>virksomheten.</em></h2></div><div><p>Vedøy Growth samler kunder, prosjekter, booking, timer, notater og oppfølging i ett sentralt styrebord. Du får én rolig arbeidsflate for det som er aktivt, og tydelig beskjed når en modul krever en annen plan.</p><div className="growth-showcase__actions"><Link href="/login" className="editorial-button">Åpne Growth <span>↗</span></Link><Link href="/start-bedrift" className="editorial-outline">Registrer bedrift</Link><Link href="/pricing#vedoy-growth" className="editorial-outline">Se priser</Link></div></div></div>
    <div className="growth-preview" aria-label="Forhåndsvisning av Vedøy Growth-styrebord"><div className="growth-preview__bar"><span>VØ</span><b>Vedøy Growth</b><small>SENTRALT STYREBORD</small></div><aside><strong>Oversikt</strong><span>Henvendelser</span><span>Prosjekter</span><span>Notater</span><span>Statistics</span></aside><main><small>GOD MORGEN</small><h3>Én plass for neste steg.</h3><div><article><small>AKTIVE PROSJEKTER</small><b>03</b></article><article><small>ÅPNE HENVENDELSER</small><b>06</b></article><article><small>DENNE UKEN</small><b>12 t</b></article></div></main></div>
    <div className="growth-plans">{plans.map((plan) => <article className={plan.featured ? "is-featured" : ""} key={plan.name}><small>{plan.name}</small><h3>{plan.price}<span>/{plan.detail}</span></h3><ul>{plan.items.map((item) => <li key={item}>✓ {item}</li>)}</ul><Link href="/start-bedrift">{plan.action} <span>↗</span></Link></article>)}</div>
    <p className="growth-showcase__note">Lanseringspriser og tilgang aktiveres manuelt av Vedøy. Betaling og abonnement starter ikke automatisk før betalingsløsningen er ferdig konfigurert. Setetak kontrolleres ved registrering.</p>
  </section>;
}
