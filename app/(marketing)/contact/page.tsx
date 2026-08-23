import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="legal-page">
      <div className="container">
        <p className="eyebrow">TA KONTAKT</p>
        <h1>Vi hjelper deg videre.</h1>
        <p>Har du spørsmål om domener, nettsider, booking eller en løsning for virksomheten din? Send oss en melding, så finner vi et godt neste steg.</p>
        <a className="button button--dark" href="mailto:hei@vedoy.no">hei@vedoy.no ↗</a>
        <p>Vedøy · Haugesund · Org.nr. 937 024 622</p>
        <Link className="text-link" href="/">Tilbake til forsiden</Link>
      </div>
    </main>
  );
}
