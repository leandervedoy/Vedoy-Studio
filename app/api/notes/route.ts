import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createStudioNote, listStudioNotes } from "@/lib/repository";
import type { StudioNoteColor } from "@/lib/types";

const colors = new Set<StudioNoteColor>(["sand", "lemon", "mint", "lavender", "coral"]);

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanTags(value: unknown) {
  return Array.isArray(value) ? value.filter((tag): tag is string => typeof tag === "string").map((tag) => clean(tag, 32)).filter(Boolean).slice(0, 12) : [];
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
      pinned: body.pinned === true,
      notebook: clean(body.notebook, 80) || "Arbeidsområde",
      section: clean(body.section, 80) || "Generelt",
      tags: cleanTags(body.tags)
    });
    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("studio_note_create_failed", error);
    return NextResponse.json({ error: "Notatet kunne ikke lagres." }, { status: 503 });
  }
}
