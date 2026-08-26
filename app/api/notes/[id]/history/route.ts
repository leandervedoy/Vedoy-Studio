import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listStudioNoteVersions, restoreStudioNoteVersion } from "@/lib/repository";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  const { id } = await params;
  return NextResponse.json({ versions: await listStudioNoteVersions(id) });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  try {
    const { id } = await params;
    const body = await request.json() as { versionId?: string };
    if (!body.versionId) return NextResponse.json({ error: "Velg en versjon." }, { status: 400 });
    return NextResponse.json({ note: await restoreStudioNoteVersion(id, body.versionId) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Versjonen kunne ikke gjenopprettes." }, { status: 400 });
  }
}
