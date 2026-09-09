import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HostingConfigurator } from "@/components/hosting-configurator";
import { ShopifyToolGuide } from "@/components/shopify-tool-guide";
import { ProductCustomizer } from "@/components/product-customizer";
import { ServicePricing } from "@/components/service-pricing";
import { getStudioService, studioServices } from "@/lib/services";
import { isDomainProviderConfigured } from "@/lib/vercel-domains";

export function generateStaticParams() {
  return studioServices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const service = getStudioService((await params).slug);
  return service ? { title: service.title, description: service.lead } : {};
}

export default async function ServicePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ domain?: string; domainMode?: string }> }) {
  const service = getStudioService((await params).slug);
  if (!service) notFound();
  const query = await searchParams;
  const isHosting = service.slug === "hosting-og-domene";
  const isWebsite = service.slug === "nettsider";
  const isWebApp = service.slug === "webapper";
  const isStore = service.slug === "nettbutikk";
  const isShopify = service.slug === "shopify-og-commerce";
  const isClothing = service.slug === "profilprodukter";

  return (
    <main className="service-detail-page">
      <header className="service-detail-header"><Link href="/" className="editorial-logo"><img src="/imgs/Logos/Vedoy_Logo_W.png" alt="Vedøy Studio" /></Link><nav><Link href="/#tjenester">Alle tjenester</Link><Link href="/#prosjekter">Prosjekter</Link><Link href="/#kontakt">Kontakt</Link></nav><Link href="/#kontakt" className="editorial-cta">Start prosjekt <span>↗</span></Link></header>
      <section className="service-detail-hero">
        <div><Link href="/#tjenester" className="service-back">← Tilbake til tjenestene</Link><p className="editorial-kicker lime">{service.number} · {service.eyebrow}</p><span className="service-live-badge">KAN BESTILLES NÅ</span><h1>{service.title}<br /><em>bygget ordentlig.</em></h1></div>
        <div className="service-detail-intro"><strong>{service.lead}</strong><p>{service.introduction}</p><Link href={isHosting ? "#konfigurer-hosting" : isClothing ? "#bestill-profilprodukter" : "/#kontakt"} className="editorial-button">{isHosting ? "Bestill hosting" : isClothing ? "Åpne bestillingsskjema" : "Send bestillingsforespørsel"} <span>↗</span></Link></div>
      </section>
      <section className="service-detail-grid">
        <article><small>DETTE KAN INNGÅ</small><h2>Fra behov til<br /><em>ferdig løsning.</em></h2><ul>{service.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><small>TEKNOLOGI OG FOKUS</small><div className="service-focus-list">{service.focus.map((item) => <span key={item}>{item}</span>)}</div><p>{service.nextStep}</p></article>
      </section>
      <section className="service-process"><p className="editorial-kicker lime">SLIK GJØR VI DET</p><div>{service.process.map((step, index) => <article key={step}><small>0{index + 1}</small><p>{step}</p></article>)}</div></section>
      {isWebsite ? <ServicePricing type="website" /> : null}
      {isWebApp ? <ServicePricing type="webapp" /> : null}
      {isStore ? <ServicePricing type="store" /> : null}
      {isClothing ? <ServicePricing type="clothing" /> : null}
      {isHosting ? <HostingConfigurator initialDomain={query.domain} initialDomainMode={query.domainMode === "new" ? "new" : "existing"} domainProviderReady={isDomainProviderConfigured()} /> : null}
      {isClothing ? <section className="clothing-detail-section" id="bestill-profilprodukter"><div><p className="editorial-kicker lime">VEDØY COLLECTIVE · BESTILL NÅ</p><h2>Velg plagg.<br /><em>Last opp logo.</em></h2><p>Prøv logoen på plaggene under og send en uforpliktende forespørsel. Tapstitch kan håndtere produksjon og fulfilment for aktuelle produkter; Vedøy Studio følger deg gjennom valg, korrektur og pris.</p><div className="clothing-partner-note"><strong>Slik fungerer det</strong><span>1. Velg plagg og last opp logo</span><span>2. Send antall, størrelser og detaljer</span><span>3. Vi avklarer produksjon og sender tilbud</span><small>Ingen automatisk betaling eller kjøp skjer når skjemaet sendes.</small></div></div><ProductCustomizer /></section> : null}
      {isShopify ? <ShopifyToolGuide /> : null}
      {!isWebsite && !isWebApp && !isStore && !isClothing ? <ServicePricing type="general" /> : null}
      <section className="service-detail-cta"><p className="editorial-kicker lime">NESTE STEG</p><h2>La oss gjøre det<br /><em>konkret.</em></h2><p>{service.nextStep}</p><Link href="/#kontakt" className="editorial-button">Snakk med Vedøy Studio <span>↗</span></Link></section>
    </main>
  );
}
