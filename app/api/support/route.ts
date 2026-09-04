import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createTicket, listTickets } from "@/lib/repository";

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  return NextResponse.json({ tickets: await listTickets() });
}

export async function POST(request: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  const body = await request.json() as { subject?: string; message?: string; priority?: "low" | "normal" | "high" };
  if (!body.subject || !body.message || body.subject.trim().length < 3 || body.message.trim().length < 10) {
    return NextResponse.json({ error: "Skriv et tydelig emne og minst ti tegn i meldingen." }, { status: 400 });
  }
  const ticket = await createTicket({
    subject: body.subject,
    message: body.message,
    priority: body.priority ?? "normal"
  });
  return NextResponse.json({ ticket }, { status: 201 });
}
