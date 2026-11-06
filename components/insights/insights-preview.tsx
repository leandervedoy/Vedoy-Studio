import Link from "next/link";
import { INSIGHT_ARTICLES } from "@/lib/insights-articles";
import styles from "./insights-preview.module.css";

/** Uses the same source as /insights so new articles appear here without manual duplication. */
export function InsightsPreview() {
  const articles = [...INSIGHT_ARTICLES]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 3);
  if (articles.length === 0) return null;

  return (
    <section className={styles.section} id="insights" aria-labelledby="insights-preview-heading">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <p className={styles.kicker}>VEDOY INSIGHTS / NYESTE ARTIKLER</p>
            <h2 id="insights-preview-heading">Teknologi som<br /><em>tar form.</em></h2>
            <p className={styles.lead}>Artikler og erfaringer fra utviklingen av Vedøys egne prosjekter.</p>
          </div>
          <Link href="/insights" className={styles.all}>Se alle artikler <span aria-hidden="true">↗</span></Link>
        </div>
        <div className={styles.grid}>
          {articles.map((article, index) => (
            <article className={styles.card} key={article.slug}>
              <div className={styles.meta}>
                <span>{String(index + 1).padStart(2,"0")} / {article.category}</span>
                <time dateTime={article.publishedAt}>
                  {new Date(article.publishedAt).toLocaleDateString("nb-NO", {
                    day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Oslo"
                  })}
                </time>
              </div>
              <h3><Link href={`/insights/${article.slug}`}>{article.title}</Link></h3>
              <p className={styles.excerpt}>{article.excerpt}</p>
              <div className={styles.bottom}>
                <span>{article.readingMinutes} min lesing</span>
                <Link href={`/insights/${article.slug}`}>Les artikkelen <span aria-hidden="true">↗</span></Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
