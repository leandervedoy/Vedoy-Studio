import Link from "next/link";
import { listPublishedPrices, money, type CatalogPrice } from "@/lib/vedoy-catalog";

export async function BookingAccessPanel() {
  let plans: CatalogPrice[] = [];
  try { plans = await listPublishedPrices("growth"); }
  catch (error) { console.warn("Growth pricing unavailable", error instanceof Error ? error.message : "unknown"); }

  return <section className="booking-access" aria-labelledby="booking-access-title">
    <header><div><p className="eyebrow">VEDØY GROWTH · TILGANG</p><h2 id="booking-access-title">Prøv produktet.<br />Velg riktig <em>bedriftsplan.</em></h2></div>
      <p>Dette er en produktdemo, ikke en bekreftet salgsbooking. Hvis du ønsker å snakke med Vedøy om et prosjekt, bruk kontaktskjemaet.</p></header>
    <div className="booking-access__plans">
      <article className="is-trial"><div><small>PRØVEPERIODE</small><h3>Prøv Growth</h3><p>Be om en prøveperiode. Konto og tilgang aktiveres etter godkjenning.</p></div><Link href="/start-bedrift?plan=trial&source=booking">Søk om prøveperiode ↗</Link></article>
      {plans.map(plan => <article className="is-locked" key={plan.code}><div>
        <small>GROWTH-ABONNEMENT</small><h3>{plan.title}</h3><strong>{money(plan.amountOre)} /{plan.billingPeriod === "month" ? "mnd" : "time"}</strong><p>{plan.description}</p></div>
        <Link href="/pricing#growth-priser">Se priser ↗</Link></article>)}
    </div>
    <footer><span>✓ Ingen automatisk betaling</span><span>✓ Priser fra Vedoy Pricing</span><Link href="/?need=Prosjektprat&source=booking-demo#kontakt">Be om en prosjektprat ↗</Link></footer>
  </section>;
}
