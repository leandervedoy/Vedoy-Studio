import type {Metadata} from "next";
import Link from "next/link";
import "@/packages/forma/styles.css";
import "../forma/forma-docs.css";
export const metadata:Metadata={
 title:"Vedoy Forge – modulært utviklingsrammeverk for web, apper og spill",
 description:"Vedoy Forge er et planlagt utviklingsrammeverk som skal samle web, mobil, 2D/3D, språkadaptere, Forma og Motion i et modulært system.",
 alternates:{canonical:"/developers/forge"}
};
const features=[
 ["01","Web og apper","Planlagt verktøykjede for raske nettsider, webapper og multiplattform-applikasjoner."],
 ["02","2D, 3D og spill","Motoradaptere og gjenbrukbare moduler for interaktive opplevelser og spill."],
 ["03","Flere språk","En arkitektur for adaptere til JavaScript, TypeScript og andre språk uten å tvinge alle inn i én runtime."],
 ["04","Vedoy Forma","Valgfritt, selvstendig designlag med responsive layouts og 50 UI-komponenteksempler."],
 ["05","Vedoy Motion","Valgfritt animasjonsbibliotek med eksisterende kode, støtte for reduced motion og scroll-reveal."],
 ["06","VedoyScript","Et eksperimentelt, menneskevennlig språk som kan få en egen adapter når parser og kompilator er stabile."]
] as const;
export default function ForgePage(){return <div className="vf-site"><header className="vf-site-header">
 <Link href="/developers/forge"><span className="vf-brand-mark">F⌁</span> Vedoy Forge</Link>
 <nav aria-label="Produktnavigasjon"><Link href="/developers">Developers</Link><Link href="/developers/forge">Forge</Link><Link href="/developers/forma">Forma</Link><Link href="/developers/forma/components">UI-komponenter</Link></nav>
 </header>
 <main className="vf-landing">
  <section className="vf-landing-hero">
   <p className="vf-kicker">VEDOY FORGE · UNDER UTVIKLING</p>
   <h1>One framework.<br/><em>Endless possibilities.</em></h1>
   <p>Vedoy Forge er Vedøys planlagte utviklingsrammeverk for web, apper og spill. Målet er å samle gjenbrukbare verktøy, språkadaptere, design og 2D/3D-utvikling – uten å låse deg til ett språk eller én plattform.</p>
   <div className="vf-row"><Link className="vf-primary-link" href="/developers/forma/components">Utforsk Forma-komponentene ↗</Link><Link className="vf-secondary-link" href="/developers">Tilbake til Developers</Link></div>
  </section>
  <section className="vf-landing-grid" aria-label="Planlagte Forge-moduler">{features.map(([id,title,description])=><article key={id}><span>{id} / FORGE</span><h2>{title}</h2><p>{description}</p></article>)}</section>
  <section className="vf-landing-section">
   <p className="vf-kicker">MODULÆR ARKITEKTUR</p><h2>Én kjerne. Flere muligheter.</h2>
   <p>Forge skal fungere med tydelige moduler og adaptere. Forma blir et anbefalt, men valgfritt UI-lag. Prosjekter skal kunne velge egne designbiblioteker, databaser og teknologistakker. Interoperabilitet og testing prioriteres før bred plattformstøtte.</p>
   <div className="vf-feature-list"><div><strong>Forge Core</strong><p>Prosjektoppsett, bygging, konfigurasjon og moduladministrasjon (planlagt).</p></div><div><strong>Forma + Motion</strong><p>Separat designsystem og animasjoner. Eksisterende prototyper kan utvikles og testes uavhengig.</p></div><div><strong>Språkadaptere</strong><p>Tiltenkt integrasjon med JavaScript, TypeScript og senere flere språk.</p></div><div><strong>Spill og 3D</strong><p>Planlagte integrasjoner med motorteknologi, ikke en ferdig spillmotor.</p></div></div>
  </section>
  <section className="vf-landing-section"><p className="vf-kicker">STATUS</p><h2>Ambisiøs retning. Tydelig beta.</h2>
   <p>Forge er foreløpig en produkt- og arkitekturretning, ikke et komplett installérbart rammeverk. Denne siden beskriver målene og skillene mellom produktene. Forma-komponentgalleriet er tilgjengelig som en tidlig implementasjon.</p>
   <Link className="vf-primary-link" href="/developers/forma">Les om Vedoy Forma ↗</Link>
  </section>
 </main>
 <footer className="vf-site-footer"><span>Vedoy Forge · Planlagt utviklingsrammeverk</span><span>Utviklet av <Link href="/developers">Vedoy Studio</Link></span></footer>
 </div>}
