import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession, isAdminSession } from "@/lib/auth";
import { sameOrigin } from "@/lib/customer-input";
import { updateBuilderBlock } from "@/lib/page-builder";

const blockSchema = z.object({
  pageId: z.string().min(1).max(100),
  content: z.object({
    eyebrow: z.string().max(180).optional(),
    heading: z.string().max(180).optional(),
    body: z.string().max(1000).optional(),
    ctaLabel: z.string().max(80).optional(),
    ctaHref: z.string().max(300).optional(),
    items: z.array(z.object({ title: z.string().max(120), text: z.string().max(300), price: z.string().max(80).optional() })).max(6).optional()
  }).strict()
});

export async function PATCH(request: Request, context: { params: Promise<{ blockId: string }> }) {
  if (!isAdminSession(await getSession())) return NextResponse.json({ error: "Krever administratortilgang." }, { status: 403 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 403 });
  const parsed = blockSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ugyldige elementegenskaper." }, { status: 400 });
  const { blockId } = await context.params;
  try {
    return NextResponse.json({ block: await updateBuilderBlock({ blockId, ...parsed.data }) });
  } catch (cause) {
    return NextResponse.json({ error: cause instanceof Error ? cause.message : "Kunne ikke oppdatere elementet." }, { status: 400 });
  }
}
