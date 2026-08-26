import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listWorkTimeEntries, startWorkTimer, stopWorkTimer } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  return NextResponse.json({ entries: await listWorkTimeEntries(session.email) });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  const body = await request.json().catch(() => null) as { action?: string; note?: string } | null;
  try {
    if (body?.action === "start") {
      const entry = await startWorkTimer(session.email, typeof body.note === "string" ? body.note.slice(0, 300) : "");
      return NextResponse.json({ entry }, { status: 201 });
    }
    if (body?.action === "stop") {
      await stopWorkTimer(session.email);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Ukjent handling." }, { status: 400 });
  } catch (error) {
    const duplicate = typeof error === "object" && error !== null && "code" in error && error.code === "23505";
    return NextResponse.json({ error: duplicate ? "En timer kjører allerede." : "Kunne ikke oppdatere timene." }, { status: duplicate ? 409 : 503 });
  }
}
