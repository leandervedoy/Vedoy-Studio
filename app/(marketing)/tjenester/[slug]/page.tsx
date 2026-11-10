import type { Metadata } from "next";
import "@/app/service-showcase.css";
import { MarketingHeader } from "@/components/marketing-header";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HostingConfigurator } from "@/components/hosting-configurator";
import { EcommercePlatformGuide } from "@/components/shopify-tool-guide";
import { ProductCustomizer } from "@/components/product-customizer";
import { ServicePricing } from "@/components/service-pricing";
import { CollectiveBulkPackages } from "@/components/collective/bulk-packages";
import { ServiceCapabilities } from "@/components/website-capabilities";
import { getStudioService } from "@/lib/services";
import { serviceStories } from "@/lib/service-stories";
import { ServiceShowcase } from "@/components/service-showcase";
import { ProjectScreenshotGallery } from "@/components/project-screenshot-gallery";
import { STUDIO_SCREENSHOTS } from "@/lib/project-screenshots";
import { isDomainProviderConfigured } from "@/lib/vercel-domains";
import { MonetizedInsightsSection } from "@/components/insights/monetized-insights-section";

const serviceCtas: Record<string, { label: string; href: string }> = {
  nettsider: { label: "Be om tilbud på nettside", href: "/?need=Nettside&source=service-nettsider#kontakt" },
  webapper: { label: "Be om tilbud på webapp", href: "/?need=Webapp&source=service-webapp#kontakt" },
  nettbutikk: { label: "Be om tilbud på nettbutikk", href: "/?need=Nettbutikk&source=service-nettbutikk#kontakt" },
  "hosting-og-domene": { label: "Konfigurer hosting og domene", href: "#konfigurer-hosting" },
  "design-og-profil": { label: "Be om tilbud på design", href: "/?need=Design%20og%20profil&source=service-design#kontakt" },
  profilprodukter: { label: "Bestill klær med logo", href: "#bestill-profilprodukter" },
  ecommerce: { label: "Velg Payhip eller Shopify", href: "#velg-handelsplattform" },
  "trykk-og-print": { label: "Be om tilbud på trykk", href: "/?need=Trykk%20og%20print&source=service-trykk#kontakt" },
  "musiker-og-artist": { label: "Be om en artistpakke", href: "/?need=Musiker%20og%20artist&source=service-artist#kontakt" },
  "kunstner-og-merch": { label: "Be om tilbud på kunst og merch", href: "/?need=Kunstner%20og%20merch&source=service-kunst#kontakt" },
  "vedoy-growth": { label: "Be om Growth-tilbud", href: "/?need=Ved%C3%B8y%20Growth&source=service-growth#kontakt" }
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
  const isUpcoming = service.slug === "vedoy-phone" || service.slug === "vedoy-rewards";
  const story = serviceStories[service.slug];
  const serviceCta = isUpcoming ? { label: "Meld interesse", href: "/?need=Prosjektprat&source=upcoming#kontakt" } : serviceCtas[service.slug] ?? { label: `Be om tilbud på ${service.title.toLocaleLowerCase("nb-NO")}`, href: "/?need=Prosjektprat&source=service#kontakt" };

  return (
    <main className="service-detail-page">
      <MarketingHeader variant="service" />
      <Link href="/#tjenester" className="service-back">← Tilbake til tjenestene</Link>
      <section className="service-detail-hero service-detail-hero--compact">
        <div><p className="editorial-kicker lime">{service.number} · {service.eyebrow}</p><span className="service-live-badge">{isUpcoming ? "KOMMER SNART · UNDER UTVIKLING" : isEcommerce ? "DEMO · KAN UTFORSKES" : "KAN BESTILLES NÅ"}</span><h1>{service.title}<br /><em>{story ? story.heroEmphasis : isWebsite ? "for bedrifter." : "bygget ordentlig."}</em></h1></div>
        <div className="service-detail-intro"><strong>{service.lead}</strong><p>{service.introduction}</p><Link href={serviceCta.href} className="editorial-button">{serviceCta.label} <span>↗</span></Link></div>
      </section>
      {story ? <ServiceShowcase story={story} upcoming={isUpcoming} /> : null}
      <ServiceCapabilities title={service.title} slug={service.slug} simple={service.deliverables} detailed={service.focus} />
      {isHosting ? <section style={{background:"#101813"}}>
        <ProjectScreenshotGallery
          title="Se kontrollpanelet."
          intro="Vedoy Hosting demonstrerer bestilling og administrasjon av tjenester. Automatisert serveropprettelse er ikke aktivert."
          items={[STUDIO_SCREENSHOTS.hosting]}
          eyebrow="VEDOY HOSTING · DEMO"
          compact
        />
      </section> : null}
      {service.slug === "musiker-og-artist" ? <section style={{background:"#101813"}}>
        <ProjectScreenshotGallery
          title="En nettside bygget for musikken."
          intro="Bransjeeksempel med valgfrie funksjoner. Tillegg, priser og integrasjoner avklares med kunden."
          items={[STUDIO_SCREENSHOTS.artist]}
          eyebrow="ARTIST · BRANSJEDEMO"
          compact
        />
      </section> : null}
      <section className="service-detail-grid service-detail-grid--combined">
        <article><div className="service-detail-combined__intro"><small>DETTE KAN INNGÅ · TEKNOLOGI OG FOKUS</small><h2>Fra behov til<br /><em>ferdig løsning.</em></h2></div><div className="service-detail-combined__body"><div><ul>{service.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></div><div><div className="service-focus-list">{service.focus.map((item) => <span key={item}>{item}</span>)}</div><p>{service.nextStep}</p></div></div></article>
      </section>
      <section className="service-process"><p className="editorial-kicker lime">SLIK GJØR VI DET</p><div>{service.process.map((step, index) => <article key={step}><small>0{index + 1}</small><p>{step}</p></article>)}</div></section>
      {isWebsite ? <ServicePricing type="website" /> : null}
      {isWebApp ? <ServicePricing type="webapp" /> : null}
      {isStore || isEcommerce ? <ServicePricing type="store" /> : null}
      {isClothing ? <CollectiveBulkPackages /> : null}
      {isHosting ? <HostingConfigurator initialDomain={query.domain} initialDomainMode={query.domainMode === "new" ? "new" : "existing"} domainProviderReady={isDomainProviderConfigured()} /> : null}
      {isClothing ? <section className="clothing-detail-section" id="bestill-profilprodukter"><div><p className="editorial-kicker lime">VEDØY COLLECTIVE · BESTILL NÅ</p><h2>Velg plagg.<br /><em>Last opp logo.</em></h2><p>Bruk et eksempelplagg eller lim inn lenken til hvilket som helst produkt i Vedøy Collective-katalogen. Velg antall og last opp logo. Vi følger opp med riktig trykkmetode, korrektur og et konkret tilbud før noe bestilles.</p><div className="clothing-partner-note"><strong>Slik fungerer det</strong><span>1. Velg plagg og last opp logo</span><span>2. Send antall, størrelser og detaljer</span><span>3. Vi avklarer produksjon og sender tilbud</span><small>Ingen automatisk betaling eller kjøp skjer når skjemaet sendes.</small></div></div><ProductCustomizer /></section> : null}
      {isEcommerce ? <EcommercePlatformGuide /> : null}
      {!isUpcoming && !isWebsite && !isWebApp && !isStore && !isEcommerce && !isClothing ? <ServicePricing type="general" /> : null}
      <section className="service-detail-cta"><p className="editorial-kicker lime">{isUpcoming ? "MELD INTERESSE · IKKE TIL SALGS ENNÅ" : "NESTE STEG"}</p><h2>La oss gjøre det<br /><em>konkret.</em></h2><p>{service.nextStep}</p><Link href={serviceCta.href} className="editorial-button">{serviceCta.label} <span>↗</span></Link></section>
      <MonetizedInsightsSection />
    </main>
  );
}
