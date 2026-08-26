import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteStudioNoteAttachment, getStudioNoteAttachment } from "@/lib/repository";

type Params = { params: Promise<{ id: string; attachmentId: string }> };

export async function GET(_: Request, { params }: Params) {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  const { id, attachmentId } = await params;
  const attachment = await getStudioNoteAttachment(id, attachmentId);
  if (!attachment) return NextResponse.json({ error: "Vedlegget finnes ikke." }, { status: 404 });
  return new Response(new Uint8Array(attachment.data), { headers: { "Content-Type": attachment.contentType, "Content-Length": String(attachment.sizeBytes), "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(attachment.filename)}`, "Cache-Control": "private, no-store" } });
}

export async function DELETE(_: Request, { params }: Params) {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  const { id, attachmentId } = await params;
  await deleteStudioNoteAttachment(id, attachmentId);
  return NextResponse.json({ ok: true });
}
