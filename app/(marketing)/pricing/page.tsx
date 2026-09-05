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
      <div className="container"><header className="section-heading"><p className="eyebrow">KONSEPTPRISER</p><h1>En plattform som kan starte liten.</h1><p>Prisene er lagt inn som et gjennomtenkt utgangspunkt i demoen, men må endelig beregnes mot leverandørkostnader før lansering.</p></header><div className="pricing-grid">{plans.map((plan) => <article className={plan.popular ? "pricing-card is-popular" : "pricing-card"} key={plan.name}>{plan.popular && <span className="popular-label">ANBEFALT</span>}<h2>{plan.name}</h2><p>{plan.description}</p><div className="price"><strong>{plan.monthly}</strong><span>kr/mnd</span></div><ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul><Link className={plan.popular ? "button button--dark button--wide" : "button button--ghost button--wide"} href="/login">Test {plan.name}</Link></article>)}</div><div className="pricing-note"><strong>Personlig avtale</strong><p>Nettsideutvikling, migrering, kurs og større API-løsninger prises etter omfang.</p><a href="mailto:hei@vedoy.com">Snakk med Vedøy →</a></div></div>
    </section>
  );
}
