import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNewsPost } from "@/lib/repository";
import { decodeNewsCategory } from "@/lib/news-taxonomy";
import { NewsComments } from "@/components/news/news-comments";
import { NewsSponsors } from "@/components/news/news-sponsor";
import styles from "@/components/news/news-experience.module.css";

export const dynamic="force-dynamic";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const post=await getNewsPost((await params).slug);
  if(!post)return {};
  return {title:post.title,description:post.excerpt,
    alternates:{canonical:"https://vedoystudio.no/news/"+post.slug},
    openGraph:{title:post.title,description:post.excerpt,type:"article",
      publishedTime:post.publishedAt,url:"https://vedoystudio.no/news/"+post.slug}};
}
export default async function NewsArticle({params}:{params:Promise<{slug:string}>}){
  const post=await getNewsPost((await params).slug);
  if(!post)notFound();
  const category=decodeNewsCategory(post.category);
  const opinion=category.topic==="meninger";
  const date=post.publishedAt||post.createdAt;
  const words=post.content.trim().split(/\s+/).length;
  const minutes=Math.max(1,Math.ceil(words/220));
  const structured={
    "@context":"https://schema.org","@type":opinion?"OpinionNewsArticle":"NewsArticle",
    headline:post.title,description:post.excerpt,
    datePublished:date,dateModified:post.updatedAt,
    author:opinion?{"@type":"Person",name:post.authorName}:{"@type":"Organization",name:"Vedoy News"},
    publisher:{"@type":"Organization",name:"Vedoy Studio"},
    mainEntityOfPage:"https://vedoystudio.no/news/"+post.slug
  };
  return <main className={styles.articleOuter}>
    <div className={styles.articleInner}>
      <Link href={"/news?project="+category.project} className={styles.back}>← {category.projectLabel} / Nyheter</Link>
      <p className={styles.articleMeta}>{category.projectLabel.toUpperCase()} / {category.topicLabel.toUpperCase()}</p>
      {opinion?<aside className={styles.opinionDisclaimer} aria-label="Merking av meningsinnlegg"><strong>MENING · EKSTERN SKRIBENT</strong><p>Dette er et meningsinnlegg. Synspunktene er forfatterens egne og representerer ikke nødvendigvis Vedøy News eller Vedøy Studio. Redaksjonen har godkjent publiseringen, men står ikke ansvarlig for forfatterens standpunkter.</p></aside>:null}
      <h1>{post.title}</h1>
      <p className={styles.articleSummary}>{post.excerpt}</p>
      <div className={styles.byline}><span>{opinion?"Mening av ":"Av "}{post.authorName}{post.authorType==="vedi"?" · KI-assistert":""}</span><time dateTime={date}>{new Date(date).toLocaleDateString("nb-NO",{day:"numeric",month:"long",year:"numeric"})}</time><span>{minutes} min lesing</span></div>
      <article className={styles.articleBody}>{post.content.split(/\n\n+/).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</article>
      <NewsSponsors placement="article"/>
      <NewsComments slug={post.slug}/>
      <div style={{marginTop:48,paddingTop:24,borderTop:"1px solid #34503a"}}>
        <Link href="/news" className={styles.back}>Se alle nyheter ↗</Link>
      </div>
    </div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured).replace(/</g,"\\u003c")}}/>
  </main>;
}
