import Link from "next/link";
import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Kontakt Vedøy Studio",
  description: "Fortell oss hva bedriften trenger. Be om en gratis og uforpliktende prosjektprat om nettside, nettbutikk eller Vedøy Growth.",
};

export default function ContactPage() {
  return (
    <main className="legal-page">
      <div className="container">
        <p className="eyebrow">TA KONTAKT · HAUGESUND</p>
        <h1>Hva kan vi bygge sammen?</h1>
        <p>Beskriv behovet kort. Vi tar kontakt for en gratis, uforpliktende avklaring før du bestemmer deg.</p>
        <section aria-label="Send prosjektforespørsel">
          <ContactForm />
        </section>
        <p>Foretrekker du e-post? <a href="mailto:leander@vedoystudio.no">leander@vedoystudio.no</a></p>
        <p>Vedøy · Haugesund · Org.nr. 937 024 622</p>
        <Link className="text-link" href="/">Tilbake til forsiden</Link>
      </div>
    </main>
  );
}
