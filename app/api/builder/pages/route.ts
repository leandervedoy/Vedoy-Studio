import { NextResponse } from "next/server";
import { getSession, isAdminSession } from "@/lib/auth";
import { sameOrigin } from "@/lib/customer-input";
import { createBuilderPage, listBuilderPages } from "@/lib/page-builder";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminSession(await getSession())) return NextResponse.json({ error: "Krever administratortilgang." }, { status: 403 });
  return NextResponse.json({ pages: await listBuilderPages() });
}

export async function POST(request: Request) {
  if (!isAdminSession(await getSession())) return NextResponse.json({ error: "Krever administratortilgang." }, { status: 403 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  try {
    const page = await createBuilderPage({ title: typeof body?.title === "string" ? body.title : "", slug: typeof body?.slug === "string" ? body.slug : "" });
    return NextResponse.json({ page }, { status: 201 });
  } catch (cause) {
    const duplicate = typeof cause === "object" && cause && "code" in cause && cause.code === "23505";
    return NextResponse.json({ error: duplicate ? "Denne URL-en er allerede i bruk." : cause instanceof Error ? cause.message : "Kunne ikke opprette siden." }, { status: duplicate ? 409 : 400 });
  }
}
