import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { customerInput, sameOrigin } from "@/lib/customer-input";
import { createCustomer, listCustomers } from "@/lib/repository";

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  return NextResponse.json({ customers: await listCustomers() });
}

export async function POST(request: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 403 });
  const input = customerInput(await request.json().catch(() => null) as Record<string, unknown> | null);
  if (input.name.length < 2) return NextResponse.json({ error: "Skriv inn kundenavn." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(input.email)) return NextResponse.json({ error: "E-postadressen ser ikke riktig ut." }, { status: 400 });
  try {
    return NextResponse.json({ customer: await createCustomer(input) }, { status: 201 });
  } catch (error) {
    const duplicate = error instanceof Error && (error.message.includes("finnes allerede") || "code" in error && error.code === "23505");
    return NextResponse.json({ error: duplicate ? "En kunde med denne e-postadressen finnes allerede." : "Kunne ikke opprette kunden." }, { status: duplicate ? 409 : 500 });
  }
}
