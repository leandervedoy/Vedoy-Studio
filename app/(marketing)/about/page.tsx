import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="legal-page">
      <div className="container">
        <p className="eyebrow">VEDØY STUDIO</p>
        <h1>Digital infrastruktur med menneskelig oppfølging.</h1>
        <p>Vedøy Studio samler domener, nettsider, booking, analyse og utviklerverktøy i én rolig arbeidsflate for små virksomheter med store planer.</p>
        <p>Vi bygger fra Haugesund med et enkelt mål: gjøre digitale tjenester lettere å forstå, bruke og vokse med.</p>
        <div className="hero-actions"><Link className="button button--dark" href="/">Til forsiden</Link><Link className="button button--ghost" href="/contact">Kontakt oss</Link></div>
      </div>
    </main>
  );
}
