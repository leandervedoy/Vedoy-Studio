import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInsightArticle, INSIGHT_ARTICLES } from "@/lib/insights-articles";
import styles from "../insights.module.css";
import { ProjectScreenshotGallery } from "@/components/project-screenshot-gallery";
import { STUDIO_SCREENSHOTS } from "@/lib/project-screenshots";
import { QuantumInteractiveArticle } from "@/components/insights/quantum-interactive-article";
import { AdvertizePlacement } from "@/components/advertize-placement";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return INSIGHT_ARTICLES.map(({slug}) => ({slug}));
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const found = getInsightArticle((await params).slug);
  if (!found) return {};
  return {
    title: found.title,
    description: found.excerpt,
    alternates: { canonical: "/insights/"+found.slug },
    openGraph: { title: found.title, description: found.excerpt, type:"article", publishedTime:found.publishedAt }
  };
}

export default async function InsightArticlePage({params}: PageProps) {
  const found = getInsightArticle((await params).slug);
  if (!found) notFound();
  return <main className={styles.page}>
    <nav className={styles.navigation} aria-label="Hovednavigasjon">
      <Link href="/insights" className={styles.brand}>VEDØY <span>INSIGHTS</span></Link>
      <div className={styles.navlinks}><Link href="/news">Nyheter</Link><Link href="/">Vedoy Studio</Link></div>
    </nav>
    <article className={styles.article}>
      <Link href="/insights" className={styles.back}>← Alle innsikter</Link>
      <div className={styles.articleMeta}><span>{found.category}</span><time dateTime={found.publishedAt}>{new Date(found.publishedAt).toLocaleDateString("nb-NO",{day:"numeric",month:"long",year:"numeric",timeZone:"Europe/Oslo"})}</time><span>{found.readingMinutes} min lesing</span></div>
      <h1>{found.title}</h1>
      <p className={styles.articleLead}>{found.excerpt}</p>
      <p className={styles.byline}>{found.editor && found.editor === (found.journalist ?? found.author) ? <>Journalist og ansvarlig redaktør: {found.editor}<br /></> : <>{(found.journalist ?? found.author) === "Vedoy Insights" ? "Redaksjon: " : "Journalist: "}{found.journalist ?? found.author}<br />{found.editor ? <>Ansvarlig redaktør: {found.editor}<br /></> : null}</>}Publisert: <time dateTime={found.publishedAt}>{new Date(found.publishedAt).toLocaleDateString("nb-NO",{day:"numeric",month:"long",year:"numeric",timeZone:"Europe/Oslo"})}</time></p>
      {found.slug === "hva-er-kvanteteknologi-forklart-uten-mysterier" ? (
        <QuantumInteractiveArticle sections={found.sections} />
      ) : (
        <div className={styles.articleBody}>
          {found.sections.map((section,index) => <section key={section.heading}>
            <div className={styles.chapterNumber}>{String(index+1).padStart(2,"0")}</div>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph,i) => <p key={i}>{paragraph}</p>)}
          </section>)}
        </div>
      )}
      <AdvertizePlacement slot="studio-home" title="Relevant fra Vedøy" />
      {found.slug === "fra-ide-til-fungerende-teknologi-utviklingsdag-vedoy" ? <ProjectScreenshotGallery
        title="Se prosjektene fra utviklingsdagen."
        intro="Skjermbilder fra Bank, Collective og Hosting. Flere funksjoner er prototyper eller demoer, ikke ferdiglanserte produkter."
        items={[STUDIO_SCREENSHOTS.bank, STUDIO_SCREENSHOTS.collective, STUDIO_SCREENSHOTS.hosting]}
        eyebrow="VEDØY INSIGHTS · VISUELT"
        compact
      /> : null}
      <div className={styles.articleCta}><div><p className={styles.eyebrow}>{found.articleCta?.eyebrow ?? "UTFORSK PROSJEKTET"}</p><h2>{found.articleCta?.title ?? "Vedoy Deliver"}</h2><p>{found.articleCta?.description ?? "Se konseptet for lokal levering, demonstrasjon av GPS-kart og informasjon for bedrifter."}</p></div><a href={found.articleCta?.href ?? "https://vedoy-deliver.vercel.app"} target="_blank" rel="noreferrer">{found.articleCta?.linkText ?? "Se piloten"} ↗</a></div>
      <div className={styles.disclosure}>{found.disclosure ?? "Vedoy Deliver omtales som en pilot; teksten er ikke en bekreftelse på at ekte leveringstjenester eller utbetalinger er aktive."}</div>
    </article>
    <footer className={styles.footer}><Link href="/insights">← Flere artikler</Link><Link href="/">Vedoy Studio</Link></footer>
  </main>;
}
