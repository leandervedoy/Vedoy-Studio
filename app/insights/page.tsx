import type { Metadata } from "next";
import Link from "next/link";
import { INSIGHT_ARTICLES } from "@/lib/insights-articles";
import styles from "./insights.module.css";

export const metadata: Metadata = {
  title: "Vedoy Insights – teknologi, handel og utvikling",
  description: "Praktiske analyser og perspektiver fra Vedøy om teknologi, lokal handel og digitale tjenester.",
  alternates: { canonical: "/insights" },
  openGraph: { title: "Vedoy Insights", description: "Teknologi, handel og digital utvikling – forklart med praktiske eksempler.", type: "website" }
};

export default function InsightsIndex() {
  return <main className={styles.page}>
    <nav className={styles.navigation} aria-label="Hovednavigasjon">
      <Link href="/" className={styles.brand}>VEDØY <span>INSIGHTS</span></Link>
      <div className={styles.navlinks}><Link href="/news">Nyheter</Link><Link href="/">Vedoy Studio</Link></div>
    </nav>
    <section className={styles.hero}>
      <p className={styles.eyebrow}>VEDOY INSIGHTS / PERSPEKTIVER OG ANALYSE</p>
      <h1>Ideer som gjør<br /><em>en forskjell.</em></h1>
      <p className={styles.lead}>Innsikt om teknologi, tjenester og muligheter for små og store virksomheter. Praktisk forklart, uten unødvendig fagspråk.</p>
    </section>
    <section className={styles.feed} aria-label="Publiserte artikler">
      <div className={styles.sectionTitle}><span>01 / NYESTE ARTIKLER</span><span>{INSIGHT_ARTICLES.length} ARTIKKEL</span></div>
      {INSIGHT_ARTICLES.map((article) => <article key={article.slug} className={styles.card}>
        <div className={styles.cardTop}><span>{article.category}</span><time dateTime={article.publishedAt}>{new Date(article.publishedAt).toLocaleDateString("nb-NO",{day:"numeric",month:"long",year:"numeric",timeZone:"Europe/Oslo"})}</time></div>
        <h2><Link href={"/insights/"+article.slug}>{article.title}</Link></h2>
        <p>{article.excerpt}</p>
        <div className={styles.cardBottom}><span>{article.readingMinutes} min lesing</span><Link href={"/insights/"+article.slug}>Les innsikten ↗</Link></div>
      </article>)}
    </section>
    <footer className={styles.footer}><span>VEDOY INSIGHTS / EN DEL AV VEDØY</span><Link href="https://vedoy-deliver.vercel.app">Oppdag Vedoy Deliver ↗</Link></footer>
  </main>;
}
