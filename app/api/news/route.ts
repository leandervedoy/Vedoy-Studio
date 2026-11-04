import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { sameOriginWrite } from "@/lib/vedoy-manager";
import { createNewsPost, listNewsPosts } from "@/lib/repository";
import { encodeNewsCategory, hasNewsProject, hasNewsTopic } from "@/lib/news-taxonomy";

export const dynamic = "force-dynamic";
const newsSchema = z.object({
  title: z.string().trim().min(3).max(160),
  excerpt: z.string().trim().min(5).max(500),
  content: z.string().trim().min(10).max(20000),
  project: z.string().refine(hasNewsProject),
  topic: z.string().refine(hasNewsTopic),
  authorType: z.enum(["user", "vedi"]).default("user"),
});
export async function GET() {
  await requireSession();
  return NextResponse.json({ posts: await listNewsPosts(false) }, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: Request) {
  if (!sameOriginWrite(request)) return NextResponse.json({ error: "Ugyldig opphav." }, { status: 403 });
  const session = await requireSession();
  const parsed = newsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Sjekk tittel, ingress, innhold og kategori." }, { status: 400 });
  const body = parsed.data;
  const slugBase = body.title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 100) || "nyhet";
  const post = await createNewsPost({
    slug: `${slugBase}-${Date.now().toString(36)}`,
    title: body.title,
    excerpt: body.excerpt,
    content: body.content,
    category: encodeNewsCategory(body.project, body.topic),
    status: "draft",
    authorType: body.authorType,
    authorName: body.authorType === "vedi" ? "Vedi" : session.name,
    authorAvatarUrl: body.authorType === "vedi" ? undefined : session.avatarUrl,
    sortOrder: 0
  });
  return NextResponse.json({ post }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
