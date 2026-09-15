import Link from "next/link";

const accessPlans = [
  { name: "Prøv Growth", price: "0 kr", detail: "7 dager · én bruker", action: "Registrer gratis", href: "/start-bedrift?plan=trial&source=booking", trial: true },
  { name: "Growth Start", price: "29 kr/mnd", detail: "Notater, oppgaver og enkel CRM", action: "Se priser", href: "/pricing#vedoy-growth" },
  { name: "Growth Team", price: "299 kr/mnd", detail: "For små team med flere moduler", action: "Se priser", href: "/pricing#vedoy-growth" },
  { name: "Growth Plus", price: "699 kr/mnd", detail: "Mer støtte og flere brukere", action: "Se priser", href: "/pricing#vedoy-growth" }
];

export function BookingAccessPanel() {
  return (
    <section className="booking-access" aria-labelledby="booking-access-title">
      <header>
        <div>
          <p className="eyebrow">VEDØY GROWTH · TILGANG</p>
          <h2 id="booking-access-title">Bestill time uten konto.<br />Få mer med <em>registrert bedrift.</em></h2>
        </div>
        <p>Timebestilling er alltid åpen. Studio, CRM, notater og teamfunksjoner blir først aktivert i et eget arbeidsområde når virksomheten er registrert og godkjent.</p>
      </header>

      <div className="booking-access__plans">
        {accessPlans.map((plan) => (
          <article className={plan.trial ? "is-trial" : "is-locked"} key={plan.name}>
            <div>
              <small>{plan.trial ? "GRATIS START" : "⌑ LÅST TILGANG"}</small>
              <h3>{plan.name}</h3>
              <strong>{plan.price}</strong>
              <p>{plan.detail}</p>
            </div>
            <Link href={plan.href}>{plan.action} <span>↗</span></Link>
          </article>
        ))}
      </div>

      <footer>
        <span>✓ Ingen automatisk betaling</span>
        <span>✓ Eget arbeidsområde per bedrift</span>
        <span>✓ Betalte nivåer velges på prissiden</span>
      </footer>
    </section>
  );
}
