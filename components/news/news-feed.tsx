import Link from "next/link";
import { listNewsPosts } from "@/lib/repository";
import { decodeNewsCategory, postMatchesNewsFilters } from "@/lib/news-taxonomy";
import styles from "./news-feed.module.css";

export async function NewsFeed({ project, limit = 3, title = "Siste fra Vedøy", intro }: {
  project?: string;
  limit?: number;
  title?: string;
  intro?: string;
}) {
  const posts = (await listNewsPosts(true))
    .filter((post) => postMatchesNewsFilters(post.category, project))
    .slice(0, Math.max(1, Math.min(limit, 12)));

  return (
    <section className={styles.section} aria-labelledby="latest-news-title">
      <div className={styles.heading}>
        <div>
          <p className={styles.kicker}>VEDOY NEWS / NYHETER OG UTVIKLING</p>
          <h2 id="latest-news-title">{title}</h2>
          <p>{intro || "Nyheter, lanseringer og innsikt fra prosjektene vi bygger."}</p>
        </div>
        <Link className={styles.more} href={project ? `/news?project=${encodeURIComponent(project)}` : "/news"}>Alle oppdateringer ↗</Link>
      </div>
      {posts.length ? (
        <div className={styles.grid}>
          {posts.map((post) => {
            const category = decodeNewsCategory(post.category);
            return (
              <article className={styles.card} key={post.id}>
                <div className={styles.meta}>
                  <span>{category.projectLabel} / {category.topicLabel}</span>
                  <time dateTime={post.publishedAt || post.createdAt}>{new Date(post.publishedAt || post.createdAt).toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })}</time>
                </div>
                <h3><Link href={`/news/${post.slug}`}>{post.title}</Link></h3>
                <p>{post.excerpt}</p>
                <Link className={styles.read} href={`/news/${post.slug}`}>Les artikkel ↗</Link>
              </article>
            );
          })}
        </div>
      ) : (
        <p className={styles.empty}>Ingen publiserte nyheter her ennå. Oppdateringer vises automatisk når de er godkjent og publisert.</p>
      )}
    </section>
  );
}
