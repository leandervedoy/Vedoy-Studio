import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteStudioNote, updateStudioNote } from "@/lib/repository";
import type { StudioNoteColor } from "@/lib/types";

const colors = new Set<StudioNoteColor>(["sand", "lemon", "mint", "lavender", "coral"]);

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : undefined;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  try {
    const { id } = await params;
    const body = await request.json() as Record<string, unknown>;
    const color = typeof body.color === "string" && colors.has(body.color as StudioNoteColor) ? body.color as StudioNoteColor : undefined;
    const note = await updateStudioNote(id, {
      title: clean(body.title, 160),
      content: clean(body.content, 10000),
      color,
      pinned: typeof body.pinned === "boolean" ? body.pinned : undefined
    });
    return NextResponse.json({ note });
  } catch (error) {
    console.error("studio_note_update_failed", error);
    return NextResponse.json({ error: "Notatet kunne ikke oppdateres." }, { status: 503 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  try {
    const { id } = await params;
    await deleteStudioNote(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("studio_note_delete_failed", error);
    return NextResponse.json({ error: "Notatet kunne ikke slettes." }, { status: 503 });
  }
}
