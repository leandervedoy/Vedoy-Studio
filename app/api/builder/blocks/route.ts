import { NextResponse } from "next/server";
import { getSession, isAdminSession } from "@/lib/auth";
import { sameOrigin } from "@/lib/customer-input";
import { createPageBlock, pageBlockTypes, type PageBlockType } from "@/lib/page-builder";

export async function POST(request: Request) {
  if (!isAdminSession(await getSession())) return NextResponse.json({ error: "Krever administratortilgang." }, { status: 403 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 403 });
  const body = await request.json().catch(() => null) as { pageId?: unknown; type?: unknown } | null;
  if (typeof body?.pageId !== "string" || !pageBlockTypes.includes(body.type as PageBlockType)) return NextResponse.json({ error: "Velg en gyldig sidetype." }, { status: 400 });
  try {
    return NextResponse.json({ block: await createPageBlock({ pageId: body.pageId, type: body.type as PageBlockType }) }, { status: 201 });
  } catch (cause) {
    return NextResponse.json({ error: cause instanceof Error ? cause.message : "Kunne ikke legge til blokk." }, { status: 400 });
  }
}
