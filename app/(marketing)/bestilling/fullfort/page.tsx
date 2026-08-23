import Link from "next/link";
import { getStripe } from "@/lib/stripe";

export const metadata = { title: "Bestilling mottatt" };

export default async function OrderCompletePage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const sessionId = (await searchParams).session_id;
  let paid = false;
  let email = "";
  if (sessionId?.startsWith("cs_")) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
      email = session.customer_details?.email || "";
    } catch {
      paid = false;
    }
  }

  return <main className="order-result-page"><div><Link href="/">← Vedøy Studio</Link><p className="editorial-kicker lime">{paid ? "BESTILLING MOTTATT" : "STATUS KUNNE IKKE BEKREFTES"}</p><h1>{paid ? <>Takk.<br /><em>Vi setter i gang.</em></> : <>Vi må kontrollere<br /><em>betalingen.</em></>}</h1><p>{paid ? `Stripe har bekreftet bestillingen${email ? ` for ${email}` : ""}. Du får videre informasjon når løsningen klargjøres.` : "Vi fant ikke en bekreftet betaling på denne adressen. Ingen ny belastning er gjort."}</p><div><Link className="editorial-button" href="/">Til forsiden ↗</Link><a className="editorial-outline" href="mailto:leander@vedoystudio.no">Kontakt oss</a></div></div></main>;
}
