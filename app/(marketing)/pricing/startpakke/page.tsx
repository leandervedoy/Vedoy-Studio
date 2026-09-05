import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Startpakke" };

const extras = [
  ["Domene", "Fra ca. 129 kr/år", "Avhenger av domeneendelse og leverandør."],
  ["Hosting og drift", "Fra ca. 199 kr/mnd", "Kapasitet, backup, sikkerhet og support påvirker prisen."],
  ["Ekstra ansatte", "Avtales etter behov", "Startpakken gjelder grunnoppsett; flere enn 10 brukere kan gi tillegg."],
  ["Ekstra nettside", "Avtales etter omfang", "Design, innhold, migrering og funksjoner vurderes separat."],
  ["Web-app / nettbutikk", "Avtales etter prosjekt", "Fullstack-utvikling og integrasjoner prises etter rammeverk og behov."],
];

export default function StartpakkePage() {
  return (
    <section className="pricing-page pricing-start-page">
      <div className="container">
        <Link href="/pricing" className="back-link">← Tilbake til priser</Link>
        <header className="section-heading">
          <p className="eyebrow">PILOTPROGRAM · BEGRENSET TIL 10 KUNDER</p>
          <h1>Start ryddig med Vedøy Growth.</h1>
          <p>En enkel inngang for små virksomheter som vil samle drift, booking, timer og videre vekst på ett sted.</p>
        </header>
        <div className="start-package-hero">
          <div><span className="start-package-price">399 kr</span><span>/mnd i 12 måneder</span></div>
          <p>Deretter avtales videre pris ut fra behov og valgt nivå. Andre priser kan forekomme for leverandører, oppsett og tillegg.</p>
        </div>
        <div className="start-package-grid">
          <section><p className="eyebrow">DETTE FÅR DU</p><h2>En god første versjon.</h2><ul className="start-check-list"><li>Vedøy Growth-konto og virksomhetsoppsett</li><li>Grunnleggende timeregistrering og booking</li><li>Kalenderoversikt og enkel administrasjon</li><li>Opptil 10 ansatte i grunnpakken</li><li>Personlig oppstart og avklaring av behov</li></ul></section>
          <section><p className="eyebrow">VIKTIG Å VITE</p><h2>Transparent fra start.</h2><p>Startpakken er et pilottilbud for inntil 10 kunder. Den reserverer ikke automatisk domene, hosting eller andre leverandørtjenester. Vi avklarer og godkjenner slike kostnader med deg før noe bestilles.</p><Link href="/booking" className="button button--dark">Søk om startpakke <span>↗</span></Link></section>
        </div>
        <section className="start-package-costs"><p className="eyebrow">EKSEMPLER PÅ TILLEGGSKOSTNADER</p><h2>Hva kan komme i tillegg?</h2><div className="start-cost-table" role="table" aria-label="Eksempler på tilleggskostnader"><div className="start-cost-row start-cost-head" role="row"><strong>Tillegg</strong><strong>Eksempelpris</strong><strong>Merknad</strong></div>{extras.map(([name, price, note]) => <div className="start-cost-row" role="row" key={name}><strong>{name}</strong><span>{price}</span><span>{note}</span></div>)}</div></section>
      </div>
    </section>
  );
}
