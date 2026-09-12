import Link from "next/link";

const brands = [
  {
    label: "Vedøy Studio",
    icon: "🏢",
    text: "Løsninger for bedrifter og artister: nettsider, IT-systemer, design, markedsføring, merch og musikkutgivelser."
  },
  {
    label: "Vedøy Assist",
    icon: "🤖",
    text: "IT-hjelp for privatpersoner gjennom Vedi, med personlig hjelp og hjemmebesøk når KI ikke strekker til, eller når du foretrekker et menneske."
  },
  {
    label: "Vedøy Collective",
    icon: "👕",
    text: "Klær, kolleksjoner, merch og netthandel som gir Vedøy et fysisk og kreativt uttrykk."
  },
  {
    label: "Alt henger sammen",
    icon: "🧩",
    text: "Prosjektene deler erfaring, teknologi og løsninger. Det vi bygger ett sted kan styrke resten av Vedøy, én byggekloss om gangen."
  }
];

export default function AboutPage() {
  return (
    <main className="legal-page about-vedoy-page">
      <div className="container">
        <p className="eyebrow">HVORFOR VEDØY?</p>
        <h1>Et brand bygget for arbeid som kan vare.</h1>
        <p className="legal-lead">Vedøy startet etter at jeg fikk ME og måtte tenke annerledes rundt arbeid. Jeg ønsket å fortsette med IT og kreativitet, men trengte en hverdag som kunne tilpasses kapasiteten min.</p>
        <p>Derfor bygges Vedøy som et house of brands: praktiske tjenester, kreative produkter og programvare som kan støtte hverandre over tid. Målet er ikke å gjøre alt på én gang, men å bygge solide deler som kan gi verdi for kunder, bedrifter, artister og resten av økosystemet.</p>
        <section className="about-brand-grid" aria-label="Vedøy-økosystemet">
          {brands.map((brand) => <article key={brand.label}><span aria-hidden>{brand.icon}</span><h2>{brand.label}</h2><p>{brand.text}</p></article>)}
        </section>
        <div className="hero-actions"><Link className="button button--dark" href="/">Til forsiden</Link><Link className="button button--ghost" href="/#kontakt">Kontakt Vedøy</Link></div>
      </div>
    </main>
  );
}
