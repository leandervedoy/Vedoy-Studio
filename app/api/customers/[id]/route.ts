import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { customerInput, sameOrigin } from "@/lib/customer-input";
import { updateCustomer } from "@/lib/repository";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 403 });
  const input = customerInput(await request.json().catch(() => null) as Record<string, unknown> | null);
  if (input.name.length < 2) return NextResponse.json({ error: "Skriv inn kundenavn." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(input.email)) return NextResponse.json({ error: "E-postadressen ser ikke riktig ut." }, { status: 400 });
  const { id } = await context.params;
  try {
    return NextResponse.json({ customer: await updateCustomer(id, input) });
  } catch (error) {
    const duplicate = error instanceof Error && (error.message.includes("finnes allerede") || "code" in error && error.code === "23505");
    const missing = error instanceof Error && error.message === "Kunden finnes ikke.";
    return NextResponse.json({ error: duplicate ? "En kunde med denne e-postadressen finnes allerede." : missing ? "Kunden finnes ikke." : "Kunne ikke oppdatere kunden." }, { status: duplicate ? 409 : missing ? 404 : 500 });
  }
}
