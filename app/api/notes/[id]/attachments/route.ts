import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createStudioNoteAttachment, listStudioNoteAttachments } from "@/lib/repository";

const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp", "application/pdf", "text/plain", "text/markdown"]);
const maxBytes = 2 * 1024 * 1024;

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  const { id } = await params;
  return NextResponse.json({ attachments: await listStudioNoteAttachments(id) });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  try {
    const { id } = await params;
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Velg en fil." }, { status: 400 });
    if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Bruk PNG, JPG, WebP, PDF eller tekstfil." }, { status: 400 });
    if (!file.size || file.size > maxBytes) return NextResponse.json({ error: "Filen må være mindre enn 2 MB." }, { status: 400 });
    const filename = file.name.replace(/[\r\n\\/]/g, "-").slice(0, 160) || "vedlegg";
    const attachment = await createStudioNoteAttachment(id, { filename, contentType: file.type, data: Buffer.from(await file.arrayBuffer()) });
    return NextResponse.json({ attachment }, { status: 201 });
  } catch (error) {
    console.error("studio_note_attachment_failed", error);
    return NextResponse.json({ error: "Vedlegget kunne ikke lagres." }, { status: 503 });
  }
}
