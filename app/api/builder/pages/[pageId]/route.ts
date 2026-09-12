import { NextResponse } from "next/server";
import { getSession, isAdminSession } from "@/lib/auth";
import { sameOrigin } from "@/lib/customer-input";
import { publishPage } from "@/lib/page-builder";

export async function PATCH(request: Request, context: { params: Promise<{ pageId: string }> }) {
  if (!isAdminSession(await getSession())) return NextResponse.json({ error: "Krever administratortilgang." }, { status: 403 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 403 });
  const { pageId } = await context.params;
  const body = await request.json().catch(() => null) as { visibility?: unknown } | null;
  if (body?.visibility !== "draft" && body?.visibility !== "published") return NextResponse.json({ error: "Ugyldig synlighet." }, { status: 400 });
  try {
    return NextResponse.json({ page: await publishPage(pageId, body.visibility) });
  } catch (cause) {
    return NextResponse.json({ error: cause instanceof Error ? cause.message : "Kunne ikke oppdatere siden." }, { status: 400 });
  }
}
