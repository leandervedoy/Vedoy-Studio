import type { Metadata } from "next";
import { DomainSearch } from "@/components/domain-search";

export const metadata: Metadata = { title: "Domener" };

export default function DomainsPage() {
  return (
    <>
      <section className="subpage-hero">
        <div className="container subpage-hero__grid">
          <div><p className="eyebrow">VEDØY DOMAINS</p><h1>Et godt navn fortjener en ryddig start.</h1><p>Søk etter domener, sammenlign alternativer og få hjelp med DNS, nettside og profesjonell e-post.</p></div>
          <div className="subpage-callout"><small>LIVE LEVERANDØRSTATUS</small><strong>Søk og velg</strong><span>pris vises før bestilling</span><p>Tilgjengelighet kontrolleres hos registrar når søket utføres.</p></div>
        </div>
      </section>
      <section className="tool-section"><div className="container"><DomainSearch /></div></section>
      <section className="simple-feature-section"><div className="container three-columns"><article><span>01</span><h2>Søk</h2><p>Finn et navn som er lett å huske, skrive og si høyt.</p></article><article><span>02</span><h2>Koble</h2><p>Pek domenet til nettside, e-post, booking eller API.</p></article><article><span>03</span><h2>Behold kontrollen</h2><p>Se fornyelse, DNS-status og tilkoblinger fra Studio.</p></article></div></section>
    </>
  );
}
