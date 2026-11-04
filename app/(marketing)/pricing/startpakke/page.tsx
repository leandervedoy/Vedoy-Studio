import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedPrices, money, type CatalogPrice } from "@/lib/vedoy-catalog";
export const metadata: Metadata = { title:"Vedøy Growth · Pilotprogram" };
export const dynamic = "force-dynamic";
export default async function StartpakkePage() {
  let pilot: CatalogPrice | undefined;
  try { pilot = (await listPublishedPrices("campaign")).find(p => p.code === "growth-pilot"); } catch { /* never show unverified prices */ }
  return <section className="pricing-page pricing-start-page"><div className="container">
    <Link href="/pricing" className="back-link">← Tilbake til priser</Link>
    <header className="section-heading"><p className="eyebrow">VEDØY GROWTH · PILOTPROGRAM</p><h1>Start ryddig med Vedøy Growth.</h1><p>En enkel inngang for små bedrifter som vil samle drift, booking og videre vekst.</p></header>
    {pilot ? <><div className="start-package-hero"><div><span className="start-package-price">{money(pilot.amountOre)}</span><span>/mnd {pilot.vatMode==="excl"?"eks. mva":""} i 12 måneder</span></div>
      <p>{pilot.description}</p></div>
      <div className="start-package-grid"><section><p className="eyebrow">DETTE FÅR DU</p><h2>En god første versjon.</h2><ul className="start-check-list">{pilot.features.map(f=><li key={f}>{f}</li>)}</ul></section>
      <section><p className="eyebrow">VIKTIG Å VITE</p><h2>Transparent fra start.</h2><p>Prisen gjelder pilotperioden og kan ha tillegg for leverandører eller ekstra arbeid. Videre priser avtales før perioden utløper. Ingen betaling eller tjeneste startes automatisk.</p><Link href="/booking" className="button button--dark">Søk om pilotplass ↗</Link></section></div>
    </> : <div className="start-package-hero"><p>Gjeldende pilotpris er midlertidig utilgjengelig. Kontakt Vedøy for et oppdatert tilbud.</p><Link href="/#kontakt">Kontakt oss ↗</Link></div>}
    <section className="start-package-costs"><p className="eyebrow">HVA KAN KOMME I TILLEGG?</p><h2>Dette avklares alltid.</h2><p>Domene, hosting, flere brukere, nettsider og ekstra integrasjoner kan ha egne priser. Vedøy opplyser om kostnadene før en avtale.</p></section>
  </div></section>;
}
