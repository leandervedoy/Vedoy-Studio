import type { Metadata } from "next";
import Link from "next/link";
import { vedoyClearCssProduct as product } from "@/lib/digital-products/vedoy-clear-css";
import styles from "./product.module.css";

export const metadata: Metadata = {
  title: "Vedoy Clear CSS – CSS-rammeverk | Vedøy Studio",
  description: "Responsivt CSS-rammeverk basert på designsystemet fra css.vedoystudio.no. Faste markedspriser og enkel prosjektlisens.",
  alternates: { canonical: "/produkter/vedoy-clear-css" }
};

const features = [
  ["Layout som fungerer", "Grid, stack, container, split og responsiv struktur."],
  ["Komponenter", "Knapper, kort, skjemaer, varsler, merker og tabeller."],
  ["Lys og mørk modus", "Utvidbare --vd-variabler inspirert av Vedøys eget system."],
  ["Valgfri motion", "Små animasjoner som respekterer redusert bevegelse."],
  ["Uten JavaScript-avhengigheter", "Stilarkene krever ingen kjøretidsbibliotek."],
  ["Prosjektlisens", "Kommersiell bruk i én produksjonsapp eller ett nettsted."]
] as const;

export default function VedoyClearCssPage() {
  return <main className={styles.page}>
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>VEDØY <span>STUDIO</span></Link>
        <nav aria-label="Produktnavigasjon"><Link href="/produkter">Digitale produkter</Link><a href="https://css.vedoystudio.no" target="_blank" rel="noreferrer">Se designreferansen ↗</a></nav>
      </header>
      <section className={styles.hero} aria-labelledby="product-title">
        <div>
          <span className={styles.eyebrow}>CSS RAMMEVERK · V{product.version}</span>
          <h1 id="product-title">Lag mer. <em>Skriv mindre.</em></h1>
          <p>Vedoy Clear CSS samler stilvariabler, responsiv layout og de mest nyttige komponentene fra Vedøys visuelle språk i én enkel CSS-pakke.</p>
          <div className={styles.actions}>
            <a className={styles.primary} href="https://css.vedoystudio.no" target="_blank" rel="noreferrer">Se designsystemet ↗</a>
            <a className={styles.secondary} href="#priser">Se markedsprisene</a>
          </div>
          <p className={styles.draft}>Digital levering og betaling er under klargjøring. Dette er en forhåndsvisning av produktet.</p>
        </div>
        <div className={styles.mock} aria-label="Forhåndsvisning av CSS-komponenter">
          <div className={styles.mocktop}><i></i><i></i><i></i><code>vedoy-clear.css</code></div>
          <div className={styles.mockbody}>
            <small className={styles.eyebrow}>DESIGN SYSTEM</small><h2>Design med <span>klarhet.</span></h2>
            <p>Et bedre fundament for moderne grensesnitt.</p>
            <div className={styles.buttons}><b>Primær</b><b>Sekundær</b></div>
            <div className={styles.tiles}><div><strong>Kort</strong><span>Gjenbrukbare</span></div><div><strong>Skjema</strong><span>Tilgjengelige</span></div></div>
          </div>
        </div>
      </section>
      <section className={styles.section} aria-labelledby="features-title">
        <span className={styles.eyebrow}>INKLUDERT</span><h2 id="features-title">Alt du trenger for å komme i gang.</h2>
        <div className={styles.grid}>{features.map(([title,desc],i)=><article className={styles.feature} key={title}><small>{String(i+1).padStart(2,"0")}</small><h3>{title}</h3><p>{desc}</p></article>)}</div>
      </section>
      <section className={styles.section} id="priser" aria-labelledby="prices-title">
        <span className={styles.eyebrow}>FAST ENGANGSPRIS</span><h2 id="prices-title">Priser for fire markeder.</h2>
        <p className={styles.footnote}>Faste markedspriser, ikke live valutakonvertering. Eventuell MVA/VAT avklares før kjøp.</p>
        <div className={styles.pricegrid}>
          {Object.entries(product.prices).map(([currency,value])=><div className={styles.price} key={currency}><span>{currency}</span><strong>{value.formatted}</strong></div>)}
        </div>
        <div className={styles.notice} role="status"><strong>Kommer snart</strong><p>Kjøp aktiveres først når sikker fillevering, betalingsflyt og avgiftsbehandling er testet.</p></div>
      </section>
      <footer className={styles.footer}><span>© 2026 Vedøy · Vedoy Clear CSS</span><Link href="/">Tilbake til Vedøy Studio ↗</Link></footer>
    </div>
  </main>;
}
