import Link from "next/link";

const resources = [
  { label: "Dokumentasjon", text: "Hvordan Vedøy Studio, Growth, Booking, Calendar og Canvas henger sammen." },
  { label: "GitHub", text: "Åpne prosjekter, pakker og eksempler som kan gjenbrukes i Vedøy-økosystemet." },
  { label: "Node.js-biblioteker", text: "Booking, kalender, API-klienter og andre byggeklosser som senere kan pakkes separat." },
  { label: "API-er", text: "Planlagte endepunkter for booking, kunder, tjenester, nøkler, webhooks og integrasjoner." }
];

export const metadata = {
  title: "Vedøy Developers",
  description: "Dokumentasjon, GitHub, Node.js-biblioteker, API-er og utviklerressurser for Vedøy."
};

export default function DevelopersPage() {
  return (
    <main className="developers-page">
      <header className="service-detail-header"><Link href="/" className="editorial-logo"><img src="/imgs/Logos/Vedoy_Logo_W.png" alt="Vedøy Studio" /></Link><nav><Link href="/#tjenester">Tjenester</Link><Link href="/#plattform">Plattform</Link><Link href="/#prosjekter">Prosjekter</Link><Link href="/#profilprodukter">Bedriftsklær</Link><Link href="/#kontakt">Kontakt</Link></nav><Link href="/booking" className="editorial-cta">Bestill time <span>↗</span></Link></header>
      <section className="developers-hero">
        <p className="editorial-kicker lime">VEDØY DEVELOPERS</p>
        <h1>Ressurser for å bygge med Vedøy.</h1>
        <p>Her samles dokumentasjon, GitHub, API-er og gjenbrukbare biblioteker etter hvert som Vedøy-plattformen blir mer moden. Siden er laget for utviklere, samarbeidspartnere og kunder som vil forstå hva som kan kobles sammen.</p>
        <div className="hero-actions"><a className="editorial-button" href="https://discord.gg/aBbPzsWZ?event=1547558121273032724" target="_blank" rel="noreferrer">Bli med i utviklerfellesskapet <span>↗</span></a><Link className="editorial-outline" href="/#plattform">Se økosystemet</Link></div>
      </section>
      <section className="developers-resources">
        {resources.map((resource) => <article key={resource.label}><small>{resource.label}</small><h2>{resource.label}</h2><p>{resource.text}</p></article>)}
      </section>
    </main>
  );
}
