import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createStudioNoteShare, getStudioNoteShare, revokeStudioNoteShare } from "@/lib/repository";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  const { id } = await params;
  return NextResponse.json({ share: await getStudioNoteShare(id) });
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  try {
    const { id } = await params;
    return NextResponse.json({ share: await createStudioNoteShare(id) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Delingslenken kunne ikke opprettes." }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  const { id } = await params;
  await revokeStudioNoteShare(id);
  return NextResponse.json({ ok: true });
}
