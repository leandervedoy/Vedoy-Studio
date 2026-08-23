import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HostingConfigurator } from "@/components/hosting-configurator";
import { ShopifyToolGuide } from "@/components/shopify-tool-guide";
import { getStripeMode } from "@/lib/stripe";
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
  const isShopify = service.slug === "shopify-og-commerce";
  const comingSoon = service.slug !== "nettsider";

  return (
    <main className="service-detail-page">
      <header className="service-detail-header"><Link href="/" className="editorial-logo"><img src="/imgs/Logos/Vedoy_Logo_W.png" alt="Vedøy Studio" /></Link><nav><Link href="/#tjenester">Alle tjenester</Link><Link href="/#prosjekter">Prosjekter</Link><Link href="/#kontakt">Kontakt</Link></nav><Link href="/#kontakt" className="editorial-cta">Start prosjekt <span>↗</span></Link></header>
      <section className="service-detail-hero">
        <div><Link href="/#tjenester" className="service-back">← Tilbake til tjenestene</Link><p className="editorial-kicker lime">{service.number} · {service.eyebrow}</p>{comingSoon ? <span className="service-coming-badge">KOMMER SNART</span> : <span className="service-live-badge">KAN BESTILLES NÅ</span>}<h1>{service.title}<br /><em>bygget ordentlig.</em></h1></div>
        <div className="service-detail-intro"><strong>{service.lead}</strong><p>{service.introduction}</p><Link href={comingSoon ? "/#kontakt" : "/#kontakt"} className="editorial-button">{comingSoon ? "Meld interesse" : "Bestill nettside"} <span>↗</span></Link></div>
      </section>
      <section className="service-detail-grid">
        <article><small>DETTE KAN INNGÅ</small><h2>Fra behov til<br /><em>ferdig løsning.</em></h2><ul>{service.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><small>TEKNOLOGI OG FOKUS</small><div className="service-focus-list">{service.focus.map((item) => <span key={item}>{item}</span>)}</div><p>{service.nextStep}</p></article>
      </section>
      <section className="service-process"><p className="editorial-kicker lime">SLIK GJØR VI DET</p><div>{service.process.map((step, index) => <article key={step}><small>0{index + 1}</small><p>{step}</p></article>)}</div></section>
      {isHosting ? <HostingConfigurator initialDomain={query.domain} initialDomainMode={query.domainMode === "new" ? "new" : "existing"} stripeMode={getStripeMode()} domainProviderReady={isDomainProviderConfigured()} /> : null}
      {isShopify ? <ShopifyToolGuide /> : null}
      <section className="service-detail-cta"><p className="editorial-kicker lime">NESTE STEG</p><h2>La oss gjøre det<br /><em>konkret.</em></h2><p>{service.nextStep}</p><Link href="/#kontakt" className="editorial-button">Snakk med Vedøy Studio <span>↗</span></Link></section>
    </main>
  );
}
