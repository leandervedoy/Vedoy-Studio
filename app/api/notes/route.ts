import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createStudioNote, listStudioNotes } from "@/lib/repository";
import type { StudioNoteColor } from "@/lib/types";

const colors = new Set<StudioNoteColor>(["sand", "lemon", "mint", "lavender", "coral"]);

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  return NextResponse.json({ notes: await listStudioNotes() });
}

export async function POST(request: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const color = typeof body.color === "string" && colors.has(body.color as StudioNoteColor) ? body.color as StudioNoteColor : "lemon";
    const note = await createStudioNote({
      title: clean(body.title, 160) || "Uten tittel",
      content: clean(body.content, 10000),
      color,
      pinned: body.pinned === true
    });
    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("studio_note_create_failed", error);
    return NextResponse.json({ error: "Notatet kunne ikke lagres." }, { status: 503 });
  }
}
