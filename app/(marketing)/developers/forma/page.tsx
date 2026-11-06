import type {Metadata} from "next";
import Link from "next/link";
export const metadata:Metadata={
 title:"Vedoy Forma – designsystem og responsivt UI-bibliotek",
 description:"Vedoy Forma er et modulært designsystem med responsiv struktur, design tokens og 50 UI-komponenteksempler for nettsider og webapper.",
 alternates:{canonical:"/developers/forma"}
};
const features=[
 ["01","50 UI-byggesteiner","Skjemaer, innlogging og registrering som UI, gallerier, Bento Grid, navigasjon og mye mer."],
 ["02","Responsiv struktur","Flexbox, CSS Grid, container queries og fleksible mønstre som fungerer på små og store skjermer."],
 ["03","Interaktive mønstre","Faner, dialoger, menyer og karusell med et lite valgfritt JavaScript-lag."],
 ["04","Visuell menybygger","Tilpass plassering, størrelse, skrifttype, farger, skygger og lenker – og kopier koden."],
 ["05","Tilpassbare temaer","Design tokens, mørk og lys modus, avrunding og konsistente avstander."],
 ["06","Uavhengig av Forge","Bruk Forma i eksisterende HTML-, React-, Vue- og Next.js-prosjekter."]
] as const;
export default function FormaPage(){return <main className="vf-landing">
 <section className="vf-landing-hero">
  <p className="vf-kicker">VEDOY FORMA · UI FRAMEWORK · BETA</p>
  <h1>Style. Structure.<br/><em>Freedom.</em></h1>
  <p>Vedoy Forma samler styling, layout, design tokens og gjenbrukbare UI-komponenter i ett fleksibelt designsystem. Bygg mobilvennlige nettsider og webapper uten å starte fra null.</p>
  <div className="vf-row">
   <Link className="vf-primary-link" href="/developers/forma/components">Utforsk 50 komponenter ↗</Link>
   <Link className="vf-secondary-link" href="/developers/forma/components#menu-builder">Åpne menybyggeren</Link>
  </div>
 </section>
 <section className="vf-landing-grid" aria-label="Forma-funksjoner">
  {features.map(([n,name,description])=><article key={n}><span>{n} / FORMA</span><h2>{name}</h2><p>{description}</p></article>)}
 </section>
 <section className="vf-landing-section">
  <p className="vf-kicker">SKILLER STIL FRA MOTOR</p><h2>Forma alene. Eller sammen med Forge.</h2>
  <p>Forma er et eget designlag. Det kan importeres i vanlige webprosjekter, eller velges som standard i Vedoy Forge når Forge er klart. Ingen backend er nødvendig for å bruke grunnleggende styling.</p>
  <div className="vf-feature-list"><div><strong>Vedoy Forma</strong><p>Styling, responsive layouts, UI-komponenter og temaer.</p></div><div><strong>Vedoy Forge</strong><p>Planlagt utviklingsrammeverk for web, apper, 2D/3D og språkadaptere.</p></div></div>
 </section>
 <section className="vf-landing-section">
  <p className="vf-kicker">MOTION SOM TILLEGG</p><h2>Bevegelse når det gir verdi.</h2>
  <p>Eksisterende Vedoy Motion 1.0.0-kode inkluderer 15 animasjonsmønstre, scroll-reveal og støtte for redusert bevegelse. Motion er valgfritt; Forma-komponentene trenger det ikke for å fungere.</p>
 </section>
 <section className="vf-landing-section">
  <p className="vf-kicker">UTVIKLINGSSTATUS</p><h2>Bygg videre med en ærlig beta.</h2>
  <p>Første fase leverer et søkbart galleri med 50 stylede HTML/UI-mønstre, en menybygger og et valgfritt JavaScript-lag for interaktive eksempler. Pakken er foreløpig privat og ikke publisert på npm. Innlogging, registrering og kontaktvisninger er grensesnitt, ikke ferdige backend-tjenester.</p>
  <Link className="vf-primary-link" href="/developers/forma/components">Se komponenter og kode ↗</Link>
 </section>
 </main>}
