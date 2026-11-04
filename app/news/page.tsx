import Link from "next/link";
import { listNewsPosts } from "@/lib/repository";
import { NEWS_PROJECTS, NEWS_TOPICS, decodeNewsCategory, hasNewsProject, hasNewsTopic, postMatchesNewsFilters } from "@/lib/news-taxonomy";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vedoy News", description: "Nyheter, lanseringer og oppdateringer fra Vedoy." };

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ project?: string; topic?: string }> }) {
  const params = await searchParams;
  const project = params.project && hasNewsProject(params.project) ? params.project : "";
  const topic = params.topic && hasNewsTopic(params.topic) ? params.topic : "";
  const posts = (await listNewsPosts(true)).filter((post) => postMatchesNewsFilters(post.category, project || undefined, topic || undefined));
  const projectLabel = NEWS_PROJECTS.find((item) => item.slug === project)?.label;
  const urlFor = (nextProject: string, nextTopic: string) => {
    const query = new URLSearchParams();
    if (nextProject) query.set("project", nextProject);
    if (nextTopic) query.set("topic", nextTopic);
    return query.size ? `/news?${query.toString()}` : "/news";
  };

  return <main className="news-page">
    <header><Link href="/">VEDØY STUDIO</Link><span>NEWS · PROJECTS · DEVELOPMENT</span></header>
    <section className="news-hero">
      <p className="editorial-kicker lime">VEDOY NEWS</p>
      <h1>{projectLabel ? <>Nyheter fra<br /><em>{projectLabel}.</em></> : <>Det skjer hos<br /><em>Vedøy.</em></>}</h1>
      <p>Oppdateringer, lanseringer og innsikt fra prosjektene vi bygger.</p>
    </section>
    <nav aria-label="Filtrer nyheter etter prosjekt" style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "18px 0 12px" }}>
      <Link href={urlFor("", topic)} aria-current={!project ? "page" : undefined} className="button button--small">Alle prosjekter</Link>
      {NEWS_PROJECTS.map((item) => <Link key={item.slug} href={urlFor(item.slug, topic)} aria-current={project === item.slug ? "page" : undefined} className="button button--small">{item.label}</Link>)}
    </nav>
    <nav aria-label="Filtrer nyheter etter kategori" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
      <Link href={urlFor(project, "")} aria-current={!topic ? "page" : undefined} className="button button--small">Alle kategorier</Link>
      {NEWS_TOPICS.map((item) => <Link key={item.slug} href={urlFor(project, item.slug)} aria-current={topic === item.slug ? "page" : undefined} className="button button--small">{item.label}</Link>)}
    </nav>
    <section className="news-grid" aria-label="Publiserte nyheter">
      {posts.length ? posts.map((post) => {
        const category = decodeNewsCategory(post.category);
        return <article key={post.id}>
          <small>{category.projectLabel} / {category.topicLabel} · {post.authorName}{post.authorType === "vedi" ? " · KI" : ""}</small>
          <h2><Link href={`/news/${post.slug}`}>{post.title}</Link></h2>
          <p>{post.excerpt}</p>
          <Link href={`/news/${post.slug}`}>Les nyheten ↗</Link>
        </article>;
      }) : <p>Ingen publiserte innlegg i denne kategorien ennå.</p>}
    </section>
  </main>;
}
