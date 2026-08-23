import type { Metadata } from "next";
import { PublicBooking } from "@/components/booking/public-booking";
import { getIntegrationStatuses } from "@/lib/integration-status";

export const metadata: Metadata = { title: "Booking-demo" };

export default async function BookingPage() {
  const statuses = await getIntegrationStatuses();
  const stripe = statuses.find((item) => item.id === "stripe");
  const demoIntegrations = statuses.filter((item) => item.demo && item.id !== "stripe");
  return (
    <>
      <section className="subpage-hero subpage-hero--compact"><div className="container"><p className="eyebrow">INTERAKTIV DEMO</p><h1>Prøv Vedøy Booking.</h1><p>Velg en tjeneste, trykk på en dato og send en testbestilling. Demoen bruker API-et i prosjektet.</p></div></section>
      <section className="booking-public-section"><div className="container">
        <div className="demo-disclaimer" role="status">
          <strong>Demo er aktiv</strong><br />
          Bookinger lagres som forespørsler og får status <code>pending</code>. {stripe?.status === "healthy" ? "Stripe er klar for betaling når betalingsflyten aktiveres." : "Stripe er ikke ferdig konfigurert, så ingen betaling blir trukket."}
          <br /><small>{demoIntegrations.map((item) => `${item.name}: ${item.status}`).join(" · ")}</small>
        </div>
        <PublicBooking /><p className="demo-disclaimer">Dette er en produktdemo. Ingen betaling, e-post/SMS eller ekstern kalenderhendelse sendes før integrasjonene er konfigurert og testet.</p>
      </div></section>
    </>
  );
}
