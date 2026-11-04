import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { sameOriginWrite } from "@/lib/vedoy-manager";
import { updateNewsPost } from "@/lib/repository";
import { encodeNewsCategory, hasNewsProject, hasNewsTopic } from "@/lib/news-taxonomy";

const schema = z.object({
  title: z.string().trim().min(3).max(160).optional(),
  excerpt: z.string().trim().min(5).max(500).optional(),
  content: z.string().trim().min(10).max(20000).optional(),
  project: z.string().refine(hasNewsProject).optional(),
  topic: z.string().refine(hasNewsTopic).optional(),
  status: z.enum(["draft", "published"]).optional()
}).refine((input) => (input.project === undefined) === (input.topic === undefined), {
  message: "Velg både prosjekt og kategori."
});
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOriginWrite(request)) return NextResponse.json({ error: "Ugyldig opphav." }, { status: 403 });
  const session = await requireSession();
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ugyldige nyhetsdata." }, { status: 400 });
  const body = parsed.data;
  const canPublish = ["vedoy_owner", "owner", "admin"].includes(session.role);
  if (body.status && !canPublish) {
    return NextResponse.json({ error: "Du har ikke tilgang til å endre publiseringsstatus." }, { status: 403 });
  }
  const { id } = await context.params;
  const post = await updateNewsPost(id, {
    title: body.title,
    excerpt: body.excerpt,
    content: body.content,
    category: body.project && body.topic ? encodeNewsCategory(body.project, body.topic) : undefined,
    status: body.status,
  });
  return NextResponse.json({ post }, { headers: { "Cache-Control": "no-store" } });
}
