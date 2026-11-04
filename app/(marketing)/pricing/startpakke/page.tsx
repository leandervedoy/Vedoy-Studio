import type { Metadata } from "next";
import Link from "next/link";
import { getVedoyPrices, getPriceByCode, formatCatalogPrice, vatLabel } from "@/lib/vedoy-pricing";

export const metadata: Metadata = {
  title: "Vedøy Growth pilotprogram",
  description: "Søk om Vedøy Growth Pilot. Prisen hentes fra Vedoy Pricing, og søknaden er uforpliktende.",
};

export const dynamic = "force-dynamic";

export default async function StartpakkePage() {
  const campaign = getPriceByCode(await getVedoyPrices(), "growth-pilot");
  return (
    <section className="pricing-page pricing-start-page">
      <div className="container">
        <Link href="/pricing" className="back-link">← Tilbake til priser</Link>
        <header className="section-heading">
          <p className="eyebrow">VEDØY GROWTH · PILOTPROGRAM</p>
          <h1>Start ryddig med Vedøy Growth.</h1>
          <p>Et pilotopplegg for bedrifter som vil samle drift, booking, timer og kundeoppfølging. Alle forespørsler vurderes før aktivering.</p>
        </header>
        <div className="start-package-hero">
          <div><span className="start-package-price">{campaign ? formatCatalogPrice(campaign) : "Pris på forespørsel"}</span></div>
          <p>{campaign ? campaign.description : "Publisert pilotpris er midlertidig utilgjengelig."} {campaign ? vatLabel(campaign.vat_mode) + ". " : ""}Videre pris og eventuelle leverandørkostnader avklares skriftlig.</p>
        </div>
        <div className="start-package-grid">
          <section>
            <p className="eyebrow">DETTE FÅR DU</p>
            <h2>En enkel start.</h2>
            {campaign?.features?.length ? <ul className="start-check-list">{campaign.features.map(item => <li key={item}>{item}</li>)}</ul> : <p>Bedriftsoppsett og relevante moduler avtales etter behov.</p>}
          </section>
          <section>
            <p className="eyebrow">SLIK SØKER DU</p>
            <h2>Uforpliktende forespørsel.</h2>
            <p>Fortell hva bedriften trenger. Vi avklarer tilgjengelighet, oppsett, pris og vilkår før eventuell aktivering. Dette er ikke en bookingdemo eller en automatisk betaling.</p>
            <Link href="/?need=Ved%C3%B8y%20Growth&source=growth-pilot#kontakt" className="button button--dark">Søk om pilotplass <span aria-hidden="true">↗</span></Link>
          </section>
        </div>
        <section className="start-package-costs">
          <p className="eyebrow">PRIS OG LEVERANSE</p>
          <h2>Alt avklares på forhånd.</h2>
          <p>Domene, hosting, flere brukere, ekstra nettsider, webapper og andre leveranser kan gi tilleggskostnader etter avtale. Vi oppgir ikke en pris for disse tilleggene uten et konkret tilbud fra Vedoy Pricing.</p>
          <Link href="/pricing#vedoy-growth">Sammenlign Growth-planer →</Link>
        </section>
      </div>
    </section>
  );
}
