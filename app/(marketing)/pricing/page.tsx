import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHeader } from "@/components/marketing-header";
import { PricingExperience } from "@/components/vedoy-pricing/pricing-experience";
import { listPublishedContent, listPublishedPrices } from "@/lib/vedoy-catalog";
import "@/app/vedoy-pricing.css";
export const metadata: Metadata = { title: "Priser – Vedøy Studio", description: "Sammenlign abonnementer for nettside, drift, sikkerhet og IT-hjelp hos Vedøy Studio." };
export const dynamic = "force-dynamic";
export default async function PricingPage() {
  try {
    const [prices, content] = await Promise.all([listPublishedPrices(), listPublishedContent()]);
    return <main className="vp-page">
      <MarketingHeader variant="service" />
      <PricingExperience prices={prices} hero={content["pricing.hero"]} turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""} />
    </main>;
  } catch (error) {
    console.error("Pricing page cannot load current prices", error instanceof Error ? error.message : "unknown");
    return <main className="vp-page"><MarketingHeader variant="service" />
      <section className="vp-unavailable"><span>VEDØY STUDIO · PRISER</span><h1>Prisene er midlertidig utilgjengelige.</h1>
      <p>Vi viser ikke utdaterte eller anslåtte priser. Ta kontakt for en oppdatert oversikt.</p>
      <Link className="vp-primary" href="/#kontakt">Kontakt Vedøy Studio ↗</Link></section>
    </main>;
  }
}
