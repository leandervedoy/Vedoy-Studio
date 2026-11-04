import Link from "next/link";
import { getVedoyPrices, selectPrices, formatCatalogPrice } from "@/lib/vedoy-pricing";

export async function BookingAccessPanel() {
  const plans = selectPrices(await getVedoyPrices(), "growth");
  return <section className="booking-access" aria-labelledby="booking-access-title">
    <header><div><p className="eyebrow">VEDØY GROWTH · TILGANG</p><h2 id="booking-access-title">Prøv produktet.<br />Velg riktig <em>bedriftsplan.</em></h2></div>
      <p>Dette er en produktdemo, ikke en reell salgsbooking. Trenger du et møte med Vedøy? Bruk kontaktskjemaet på forsiden.</p></header>
    <div className="booking-access__plans">
      <article className="is-trial"><div><small>PRØVEPERIODE</small><h3>Prøv Growth</h3><p>Registrer virksomheten for å be om en prøveperiode. Tilgang aktiveres etter godkjenning.</p></div><Link href="/start-bedrift?plan=trial&source=booking">Be om prøveperiode ↗</Link></article>
      {plans.map(plan => <article className="is-locked" key={plan.code}>
        <div><small>GROWTH-ABONNEMENT</small><h3>{plan.title}</h3><strong>{formatCatalogPrice(plan)}</strong><p>{plan.description}</p></div>
        <Link href="/pricing#vedoy-growth">Se priser ↗</Link>
      </article>)}
    </div>
    <footer><span>✓ Ingen automatisk betaling</span><span>✓ Priser fra Vedoy Pricing</span><Link href="/?need=Prosjektprat&source=booking-demo#kontakt">Be om en ekte prosjektprat ↗</Link></footer>
  </section>;
}
