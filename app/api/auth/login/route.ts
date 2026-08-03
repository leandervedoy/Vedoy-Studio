import { NextResponse } from "next/server";
import { createSessionToken, getLoginCredentials, sessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json() as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  const credentials = getLoginCredentials();
  if (!credentials.email || !credentials.password) {
    return NextResponse.json({ error: "Innlogging er ikke konfigurert på serveren." }, { status: 503 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  if (email !== credentials.email.toLowerCase() || password !== credentials.password) {
    return NextResponse.json({ error: "Feil e-post eller passord." }, { status: 401 });
  }

  const token = createSessionToken({
    email: credentials.email,
    name: "Eiolf-Leander",
    organizationId: "org_vedoy",
    role: "owner"
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookie(token));
  return response;
}
