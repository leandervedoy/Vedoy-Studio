import type { Metadata } from "next";
import { PublicBooking } from "@/components/booking/public-booking";

export const metadata: Metadata = { title: "Booking-demo" };

export default function BookingPage() {
  return (
    <>
      <section className="subpage-hero subpage-hero--compact"><div className="container"><p className="eyebrow">INTERAKTIV DEMO</p><h1>Prøv Vedøy Booking.</h1><p>Velg en tjeneste, trykk på en dato og send en testbestilling. Demoen bruker API-et i prosjektet.</p></div></section>
      <section className="booking-public-section"><div className="container"><PublicBooking /><p className="demo-disclaimer">Dette er en produktdemo. Ingen betaling eller ekstern kalender er koblet til.</p></div></section>
    </>
  );
}
