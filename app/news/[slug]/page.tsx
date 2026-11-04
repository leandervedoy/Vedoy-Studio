import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNewsPost } from "@/lib/repository";
import { decodeNewsCategory } from "@/lib/news-taxonomy";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await getNewsPost((await params).slug);
  return post ? { title: post.title, description: post.excerpt, openGraph: { title: post.title, description: post.excerpt, type: "article", publishedTime: post.publishedAt } } : {};
}
export default async function NewsArticle({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getNewsPost((await params).slug);
  if (!post) notFound();
  const category = decodeNewsCategory(post.category);
  return <main className="news-article">
    <Link href={`/news?project=${category.project}`}>← Til {category.projectLabel}-nyheter</Link>
    <p className="editorial-kicker lime">{category.projectLabel} / {category.topicLabel}</p>
    <h1>{post.title}</h1>
    <p className="news-article__byline">
      Skrevet av {post.authorName}{post.authorType === "vedi" ? " · KI-assistert" : ""}
      {" · "}<time dateTime={post.publishedAt || post.createdAt}>{new Date(post.publishedAt || post.createdAt).toLocaleDateString("nb-NO")}</time>
    </p>
    <p className="news-article__lead">{post.excerpt}</p>
    <div className="news-article__body">{post.content.split(/\n\n+/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
  </main>;
}
