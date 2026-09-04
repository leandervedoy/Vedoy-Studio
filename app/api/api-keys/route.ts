import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createApiKey, listApiKeys } from "@/lib/repository";

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  return NextResponse.json({ keys: await listApiKeys() });
}

export async function POST(request: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  const body = await request.json() as { name?: string; scopes?: string[] };
  if (!body.name || body.name.trim().length < 2) {
    return NextResponse.json({ error: "Gi nøkkelen et navn." }, { status: 400 });
  }
  const allowedScopes = ["booking:read", "booking:write", "analytics:read", "projects:read"];
  const scopes = (body.scopes ?? ["booking:read"]).filter((scope) => allowedScopes.includes(scope));
  const created = await createApiKey(body.name, scopes);
  return NextResponse.json(created, { status: 201 });
}
