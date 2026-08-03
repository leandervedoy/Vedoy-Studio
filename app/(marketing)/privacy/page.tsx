import type { Metadata } from "next";

export const metadata: Metadata = { title: "Personvern" };

export default function PrivacyPage() {
  return <section className="legal-page"><div className="container"><p className="eyebrow">UTKAST</p><h1>Personvern i Vedøy Studio</h1><p>Dette prosjektet inneholder et teknisk eksempel og er ikke en ferdig juridisk personvernerklæring.</p><h2>Data i demoen</h2><p>Uten database lagres demoendringer i serverens minne og nullstilles ved omstart. Bookingdemoen kan inneholde navn og e-post som brukeren selv sender inn.</p><h2>Produksjon</h2><p>Før ekte kunder må Vedøy dokumentere behandlingsgrunnlag, databehandlere, lagringstid, innsyn, sletting, sikkerhet og eventuelle overføringer.</p><h2>Kontakt</h2><p>Vedøy, org.nr. 937 024 622.</p></div></section>;
}
