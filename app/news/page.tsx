import Link from "next/link";
import { listNewsPosts } from "@/lib/repository";
import { NEWS_PROJECTS, NEWS_TOPICS, decodeNewsCategory, hasNewsProject, hasNewsTopic, postMatchesNewsFilters } from "@/lib/news-taxonomy";
import { NewsSponsors } from "@/components/news/news-sponsor";
import styles from "@/components/news/news-experience.module.css";

export const dynamic="force-dynamic";
export const metadata={
  title:"Vedoy News – Teknologi du kan bruke",
  description:"Teknologinyheter, utviklingslogger, sikkerhet og praktiske guider fra Vedoy.",
  alternates:{canonical:"https://vedoystudio.no/news",types:{"application/rss+xml":"/news/rss.xml"}}
};

export default async function NewsPage({searchParams}:{searchParams:Promise<{project?:string;topic?:string;q?:string}>}){
  const params=await searchParams;
  const project=params.project&&hasNewsProject(params.project)?params.project:"";
  const topic=params.topic&&hasNewsTopic(params.topic)?params.topic:"";
  const q=String(params.q||"").trim().slice(0,90);
  const all=(await listNewsPosts(true)).filter(post=>postMatchesNewsFilters(post.category,project||undefined,topic||undefined));
  const posts=q?all.filter(post=>(post.title+" "+post.excerpt+" "+post.content).toLocaleLowerCase("nb-NO").includes(q.toLocaleLowerCase("nb-NO"))):all;
  const projectLabel=NEWS_PROJECTS.find(item=>item.slug===project)?.label;
  function url(nextProject:string,nextTopic:string){
    const query=new URLSearchParams();
    if(nextProject)query.set("project",nextProject);
    if(nextTopic)query.set("topic",nextTopic);
    if(q)query.set("q",q);
    return query.size?"/news?"+query.toString():"/news";
  }
  return <main className={styles.newsPortal}>
    <header className={styles.topbar}>
      <Link className={styles.brand} href="/news">VEDOY <span>NEWS.</span></Link>
      <nav className={styles.topLinks} aria-label="Nyhetsnavigasjon">
        <Link href="/">Vedoy Studio</Link>
        <Link href="/news/rss.xml">RSS</Link>
        <Link href="/studio/news">Redaksjon</Link>
      </nav>
    </header>
    <section className={styles.hero}>
      <p className={styles.eyebrow}>NYHETER · KODE · TEKNOLOGI · PROSJEKTER</p>
      <h1>{projectLabel?<>Siste fra <em>{projectLabel}.</em></>:<>Teknologi du <em>kan bruke.</em></>}</h1>
      <p>Teknologi forklart, bygget og utforsket. Fra kode og sikkerhet til nye verktøy, produktnyheter og åpne utviklingslogger.</p>
    </section>
    <div className={styles.filterbar}>
      <form method="GET" action="/news" role="search" className={styles.searchForm}>
        {project?<input type="hidden" name="project" value={project}/>:null}
        {topic?<input type="hidden" name="topic" value={topic}/>:null}
        <input type="search" name="q" defaultValue={q} placeholder="Søk etter teknologi, prosjekter og guider" aria-label="Søk i nyhetsartikler" maxLength={90}/>
        <button type="submit">Søk ↗</button>
      </form>
      <nav aria-label="Velg prosjekt" className={styles.pills}>
        <Link href={url("",topic)} aria-current={!project?"page":undefined}>Alle prosjekter</Link>
        {NEWS_PROJECTS.map(item=><Link key={item.slug} href={url(item.slug,topic)} aria-current={item.slug===project?"page":undefined}>{item.label}</Link>)}
      </nav>
      <nav aria-label="Velg kategori" className={styles.pills}>
        <Link href={url(project,"")} aria-current={!topic?"page":undefined}>Alle kategorier</Link>
        {NEWS_TOPICS.map(item=><Link key={item.slug} href={url(project,item.slug)} aria-current={item.slug===topic?"page":undefined}>{item.label}</Link>)}
      </nav>
    </div>
    <div className={styles.contentGrid}>
      <section aria-label="Artikler">
        <div className={styles.sectionLabel}><span>Seneste saker</span><span>{posts.length} artikler</span></div>
        <div className={styles.articleList}>
          {posts.length?posts.slice(0,30).map(post=>{
            const classification=decodeNewsCategory(post.category);
            return <article className={styles.story} key={post.id}>
              <div className={styles.storyMeta}><span>{classification.projectLabel} / {classification.topicLabel}</span><time dateTime={post.publishedAt||post.createdAt}>{new Date(post.publishedAt||post.createdAt).toLocaleDateString("nb-NO",{day:"numeric",month:"short",year:"numeric"})}</time></div>
              <h2><Link href={"/news/"+post.slug}>{post.title}</Link></h2>
              <p>{post.excerpt}</p>
              <Link className={styles.storyLink} href={"/news/"+post.slug}>Les artikkel ↗</Link>
            </article>;
          }):<p className={styles.empty}>Ingen artikler matcher søket ennå. Prøv en annen kategori eller søkestreng.</p>}
        </div>
      </section>
      <aside className={styles.side} aria-label="Mer fra Vedoy News">
        <div className={styles.sideBox}><p className={styles.eyebrow}>VEDOY LABS</p><h3>Følg utviklingen.</h3><p>Se hvilke apper, verktøy og plattformer vi bygger — og hva som skjer underveis.</p><Link href="/#prosjekter">Se prosjektene ↗</Link></div>
        <NewsSponsors placement="index"/>
        <div className={styles.sideBox}><p className={styles.eyebrow}>ÅPENT FORMAT</p><h3>Få nyhetene i din egen leser.</h3><p>Abonner gratis via RSS. Ingen sporing eller konto kreves.</p><Link href="/news/rss.xml">Åpne RSS-feed ↗</Link></div>
      </aside>
    </div>
  </main>;
}
