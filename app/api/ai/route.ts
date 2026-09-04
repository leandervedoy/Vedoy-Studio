import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { askVedi } from "@/lib/ai";

export async function POST(request: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  const body = await request.json() as { message?: string };
  const message = body.message?.trim() ?? "";
  if (message.length < 2 || message.length > 4000) {
    return NextResponse.json({ error: "Meldingen må være mellom 2 og 4000 tegn." }, { status: 400 });
  }
  try {
    return NextResponse.json(await askVedi(message));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Vedi svarte ikke." }, { status: 502 });
  }
}
