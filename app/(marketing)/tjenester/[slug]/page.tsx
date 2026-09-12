import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing-header";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HostingConfigurator } from "@/components/hosting-configurator";
import { EcommercePlatformGuide } from "@/components/shopify-tool-guide";
import { ProductCustomizer } from "@/components/product-customizer";
import { ServicePricing } from "@/components/service-pricing";
import { ServiceCapabilities } from "@/components/website-capabilities";
import { getStudioService } from "@/lib/services";
import { isDomainProviderConfigured } from "@/lib/vercel-domains";

const serviceCtas: Record<string, { label: string; href: string }> = {
  nettsider: { label: "Bestill nettside", href: "/#kontakt" },
  webapper: { label: "Be om tilbud på webapp", href: "/#kontakt" },
  nettbutikk: { label: "Bestill nettbutikk", href: "/#kontakt" },
  "hosting-og-domene": { label: "Konfigurer hosting og domene", href: "#konfigurer-hosting" },
  "design-og-profil": { label: "Bestill design og profil", href: "/#kontakt" },
  profilprodukter: { label: "Bestill klær med logo", href: "#bestill-profilprodukter" },
  ecommerce: { label: "Velg Payhip eller Shopify", href: "#velg-handelsplattform" },
  "trykk-og-print": { label: "Bestill trykk og print", href: "/#kontakt" },
  "musiker-og-artist": { label: "Be om en artistpakke", href: "/#kontakt" },
  "kunstner-og-merch": { label: "Bestill kunst og merch", href: "/#kontakt" },
  "vedoy-growth": { label: "Bestill Vedøy Growth", href: "/#kontakt" }
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const service = await getStudioService((await params).slug);
  return service ? { title: service.title, description: service.lead } : {};
}

export default async function ServicePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ domain?: string; domainMode?: string }> }) {
  const service = await getStudioService((await params).slug);
  if (!service) notFound();
  const query = await searchParams;
  const isHosting = service.renderType === "hosting";
  const isWebsite = service.renderType === "website";
  const isWebApp = service.renderType === "webapp";
  const isStore = service.renderType === "store";
  const isEcommerce = service.renderType === "ecommerce";
  const isClothing = service.renderType === "clothing";
  const serviceCta = serviceCtas[service.slug] ?? { label: `Bestill ${service.title.toLocaleLowerCase("nb-NO")}`, href: "/#kontakt" };

  return (
    <main className="service-detail-page">
      <MarketingHeader variant="service" />
      <Link href="/#tjenester" className="service-back">← Tilbake til tjenestene</Link>
      <section className="service-detail-hero service-detail-hero--compact">
        <div><p className="editorial-kicker lime">{service.number} · {service.eyebrow}</p><span className="service-live-badge">{isEcommerce ? "DEMO · KAN UTFORSKES" : "KAN BESTILLES NÅ"}</span><h1>{service.title}<br /><em>{isWebsite ? "for bedrifter." : "bygget ordentlig."}</em></h1></div>
        <div className="service-detail-intro"><strong>{service.lead}</strong><p>{service.introduction}</p><Link href={serviceCta.href} className="editorial-button">{serviceCta.label} <span>↗</span></Link></div>
      </section>
      <ServiceCapabilities title={service.title} slug={service.slug} simple={service.deliverables} detailed={service.focus} />
      <section className="service-detail-grid service-detail-grid--combined">
        <article><div className="service-detail-combined__intro"><small>DETTE KAN INNGÅ · TEKNOLOGI OG FOKUS</small><h2>Fra behov til<br /><em>ferdig løsning.</em></h2></div><div className="service-detail-combined__body"><div><ul>{service.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></div><div><div className="service-focus-list">{service.focus.map((item) => <span key={item}>{item}</span>)}</div><p>{service.nextStep}</p></div></div></article>
      </section>
      <section className="service-process"><p className="editorial-kicker lime">SLIK GJØR VI DET</p><div>{service.process.map((step, index) => <article key={step}><small>0{index + 1}</small><p>{step}</p></article>)}</div></section>
      {isWebsite ? <ServicePricing type="website" /> : null}
      {isWebApp ? <ServicePricing type="webapp" /> : null}
      {isStore || isEcommerce ? <ServicePricing type="store" /> : null}
      {isClothing ? <ServicePricing type="clothing" /> : null}
      {isHosting ? <HostingConfigurator initialDomain={query.domain} initialDomainMode={query.domainMode === "new" ? "new" : "existing"} domainProviderReady={isDomainProviderConfigured()} /> : null}
      {isClothing ? <section className="clothing-detail-section" id="bestill-profilprodukter"><div><p className="editorial-kicker lime">VEDØY COLLECTIVE · BESTILL NÅ</p><h2>Velg plagg.<br /><em>Last opp logo.</em></h2><p>Prøv logoen på plaggene under og send en uforpliktende forespørsel. Vedøy Studio kan tilby bedrifter klær via Vedøy Collective, og følger deg gjennom produktvalg, korrektur, produksjonspartner og pris før noe bestilles.</p><div className="clothing-partner-note"><strong>Slik fungerer det</strong><span>1. Velg plagg og last opp logo</span><span>2. Send antall, størrelser og detaljer</span><span>3. Vi avklarer produksjon og sender tilbud</span><small>Ingen automatisk betaling eller kjøp skjer når skjemaet sendes.</small></div></div><ProductCustomizer /></section> : null}
      {isEcommerce ? <EcommercePlatformGuide /> : null}
      {!isWebsite && !isWebApp && !isStore && !isEcommerce && !isClothing ? <ServicePricing type="general" /> : null}
      <section className="service-detail-cta"><p className="editorial-kicker lime">NESTE STEG</p><h2>La oss gjøre det<br /><em>konkret.</em></h2><p>{service.nextStep}</p><Link href={serviceCta.href} className="editorial-button">{serviceCta.label} <span>↗</span></Link></section>
    </main>
  );
}
