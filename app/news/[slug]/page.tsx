import Link from "next/link";
import { notFound } from "next/navigation";
import { getNewsPost } from "@/lib/repository";
export const dynamic = "force-dynamic";
export default async function NewsArticle({ params }: { params: Promise<{ slug: string }> }) { const post = await getNewsPost((await params).slug); if (!post) notFound(); return <main className="news-article"><Link href="/news">← Back to Vedøy News</Link><p className="editorial-kicker lime">{post.category}</p><h1>{post.title}</h1><p className="news-article__byline"><span className="news-avatar">{post.authorType === "vedi" ? "🤖" : (post.authorName[0] || "V")}</span>Written by {post.authorName} {post.authorType === "vedi" ? "· KI" : ""}</p><p className="news-article__lead">{post.excerpt}</p><div className="news-article__body">{post.content.split(/\n\n+/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></main>; }
