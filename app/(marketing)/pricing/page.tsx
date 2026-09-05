import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Priser" };

const plans = [
  { name: "Start", monthly: "299", description: "For å komme ryddig på nett.", features: ["1 domeneadministrasjon", "1 nettsideprosjekt", "Booking Lite", "Status og SSL", "Personlig oppstart"] },
  { name: "Growth", monthly: "699", description: "For å samle drift og vekst.", features: ["3 prosjekter", "Full booking", "Vedøy Canvas", "CRM", "Statistics", "Vedi AI", "Prioritert support"], popular: true },
  { name: "Business", monthly: "1 499", description: "For team og integrasjoner.", features: ["10 prosjekter", "Team og roller", "Vedøy Canvas for team", "API-nøkler", "Webhooks", "Avanserte rapporter", "Fast oppfølging"] }
];

export default function PricingPage() {
  return (
    <section className="pricing-page">
      <div className="container">
        <header className="section-heading">
          <p className="eyebrow">KONSEPTPRISER</p>
          <h1>En plattform som kan starte liten.</h1>
          <p>Prisene er et gjennomtenkt utgangspunkt i demoen. Endelig pris avhenger av leverandørkostnader, omfang og behov.</p>
        </header>

        <article className="pricing-launch-offer">
          <div>
            <p className="eyebrow">PILOTPROGRAM · 10 PLASSER</p>
            <h2>Startpakken for de første kundene.</h2>
            <p>Vi tilbyr inntil 10 virksomheter en enkel start med Vedøy Growth til <strong>399 kr/mnd i 12 måneder</strong>. Andre priser kan forekomme for tillegg, oppsett og leverandørtjenester.</p>
          </div>
          <Link href="/pricing/startpakke" className="button button--light">Se startpakken <span>↗</span></Link>
        </article>

        <div className="pricing-grid">
          {plans.map((plan) => <article className={plan.popular ? "pricing-card is-popular" : "pricing-card"} key={plan.name}>
            {plan.popular && <span className="popular-label">ANBEFALT</span>}
            <h2>{plan.name}</h2><p>{plan.description}</p>
            <div className="price"><strong>{plan.monthly}</strong><span>kr/mnd</span></div>
            <ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            <Link className={plan.popular ? "button button--dark button--wide" : "button button--ghost button--wide"} href="/login">Test {plan.name}</Link>
          </article>)}
        </div>

        <section className="pricing-examples">
          <div><p className="eyebrow">EKSEMPLER PÅ TILLEGG</p><h2>Det som kan komme i tillegg.</h2><p>Vi avklarer alt før bestilling. Ingen domene- eller hostingkjøp skjer automatisk fra dette skjemaet.</p></div>
          <ul>
            <li><strong>Domene</strong><span>Fra ca. 129 kr/år, avhengig av endelse og leverandør.</span></li>
            <li><strong>Hosting og drift</strong><span>Fra ca. 199 kr/mnd, avhengig av kapasitet, backup og support.</span></li>
            <li><strong>Flere enn 10 ansatte</strong><span>Ekstra brukere, roller og tilgang settes opp etter behov.</span></li>
            <li><strong>Web-app, nettbutikk eller fullstack</strong><span>Tilpasses prosjektet og prises etter omfang, rammeverk og integrasjoner.</span></li>
          </ul>
        </section>

        <div className="pricing-note"><strong>Personlig avtale</strong><p>Nettsideutvikling, migrering, kurs og større API-løsninger prises etter omfang.</p><a href="mailto:hei@vedoy.com">Snakk med Vedøy →</a></div>
      </div>
    </section>
  );
}
