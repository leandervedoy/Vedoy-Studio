import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nettside for bedrifter i Haugesund og på Haugalandet",
  description: "Vedøy Studio lager mobilvennlige nettsider for småbedrifter i Haugesund, Karmøy og på Haugalandet. Få en uforpliktende prosjektprat og tydelig tilbud.",
  alternates: { canonical: "/nettside-haugesund" },
};

export default function NettsideHaugesundPage() {
  return (
    <main className="legal-page">
      <div className="container">
        <p className="eyebrow">NETTSIDER · HAUGESUND OG HAUGALANDET</p>
        <h1>En nettside som gjør det lettere å bli valgt.</h1>
        <p>Driver du en liten bedrift i Haugesund, Karmøy, Tysvær eller resten av Haugalandet? Vedøy Studio kan bygge en enkel, rask og mobilvennlig nettside som forklarer hva du tilbyr, og gjør det lett for kunder å kontakte deg.</p>
        <p><Link className="button button--dark" href="/?need=Nettside&source=haugesund-seo#kontakt">Be om gratis prosjektprat →</Link></p>
        <h2>Hva får bedriften din?</h2>
        <ul>
          <li>En tydelig oversikt over tjenester, kontaktinformasjon og veien til en henvendelse.</li>
          <li>Mobiltilpasset design og grunnleggende teknisk søkemotoroptimalisering.</li>
          <li>Mulighet for kontaktskjema, booking eller nettbutikk etter behov.</li>
          <li>Avklart pris og leveranse før arbeidet blir bindende.</li>
        </ul>
        <h2>Lokalt samarbeid, uten unødvendig kompliserte løsninger</h2>
        <p>Vi starter med problemet: Trenger du å bli funnet, forklare tjenester, samle forespørsler eller redusere tid brukt på oppfølging? Du får et forslag til omfang før du bestiller. Hosting, vedlikehold og eventuelle tillegg kan avtales separat.</p>
        <h2>Hva koster en nettside?</h2>
        <p>Prisen avhenger av antall sider, design, innhold og integrasjoner. Vi bruker Vedoy Pricing for publiserte pakker og gir prosjektpris etter behovsavklaring.</p>
        <p><Link href="/pricing">Se oppdaterte Vedøy-priser →</Link> · <Link href="/tjenester/nettsider">Les om nettsidetjenesten →</Link></p>
        <h2>Fra første samtale til lansering</h2>
        <ol>
          <li>Du beskriver hva du trenger i et kort skjema.</li>
          <li>Vi avklarer innhold, funksjoner, pris og tidsplan.</li>
          <li>Vi bygger, tester og publiserer etter avtale.</li>
          <li>Du kan velge videre drift og vedlikehold.</li>
        </ol>
        <p><Link className="button button--dark" href="/?need=Nettside&source=haugesund-seo-bottom#kontakt">Fortell oss om nettsiden din →</Link></p>
        <p>Vedøy Studio · Haugesund · <a href="mailto:leander@vedoystudio.no">leander@vedoystudio.no</a></p>
      </div>
    </main>
  );
}
