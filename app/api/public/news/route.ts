import { NextResponse } from "next/server";
import { listNewsPosts } from "@/lib/repository";
import { hasNewsProject, hasNewsTopic, decodeNewsCategory, postMatchesNewsFilters } from "@/lib/news-taxonomy";

export const dynamic = "force-dynamic";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
};
export function OPTIONS() { return new Response(null, { status: 204, headers: cors }); }
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const project = params.get("project");
  const topic = params.get("topic");
  if (project && !hasNewsProject(project)) return NextResponse.json({ error: "Ukjent prosjekt." }, { status: 400, headers: cors });
  if (topic && !hasNewsTopic(topic)) return NextResponse.json({ error: "Ukjent kategori." }, { status: 400, headers: cors });
  const limit = Math.min(24, Math.max(1, Number(params.get("limit") || 6) || 6));
  const posts = (await listNewsPosts(true))
    .filter((post) => postMatchesNewsFilters(post.category, project || undefined, topic || undefined))
    .slice(0, limit)
    .map((post) => {
      const category = decodeNewsCategory(post.category);
      return {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        url: `https://vedoystudio.no/news/${encodeURIComponent(post.slug)}`,
        project: category.project,
        projectLabel: category.projectLabel,
        category: category.topic,
        categoryLabel: category.topicLabel,
        publishedAt: post.publishedAt || post.createdAt
      };
    });
  return NextResponse.json({ posts }, { headers: cors });
}
