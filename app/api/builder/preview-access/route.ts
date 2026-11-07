import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { sameOriginWrite } from "@/lib/vedoy-manager";
import { grantDraftPreview, listPreviewGrants, requirePreviewAdmin, revokeDraftPreview } from "@/lib/studio-preview-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const inputSchema = z.object({
  pageId: z.string().regex(/^page_[\w-]{1,90}$/),
  email: z.email().max(254),
  days: z.number().int().min(1).max(30).default(7)
});
const unauthorized = () => NextResponse.json({ error: "Ingen tilgang." }, { status: 403, headers: { "Cache-Control": "no-store" } });
async function isAllowed() {
  const session = await getSession();
  if (!session || !(await requirePreviewAdmin(session))) return null;
  return session;
}
export async function GET(request: Request) {
  if (!await isAllowed()) return unauthorized();
  const pageId = new URL(request.url).searchParams.get("pageId") || "";
  if (!/^page_[\w-]{1,90}$/.test(pageId)) return NextResponse.json({ error: "Ugyldig side." }, { status: 400 });
  try {
    return NextResponse.json({ grants: await listPreviewGrants(pageId) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Kunne ikke lese tilganger." }, { status: 503 });
  }
}
export async function POST(request: Request) {
  const session = await isAllowed();
  if (!session) return unauthorized();
  if (!sameOriginWrite(request)) return unauthorized();
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ugyldig mottaker eller utløpsdato." }, { status: 400 });
  try {
    await grantDraftPreview({ pageId: parsed.data.pageId, viewerEmail: parsed.data.email, grantedBy: session.email, days: parsed.data.days });
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (cause) {
    return NextResponse.json({ error: cause instanceof Error ? cause.message : "Kunne ikke dele siden." }, { status: 400 });
  }
}
export async function DELETE(request: Request) {
  if (!await isAllowed()) return unauthorized();
  if (!sameOriginWrite(request)) return unauthorized();
  const body = await request.json().catch(() => null);
  const parsed = inputSchema.pick({ pageId: true, email: true }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  try {
    await revokeDraftPreview(parsed.data.pageId, parsed.data.email);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Kunne ikke fjerne tilgangen." }, { status: 503 });
  }
}
