import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { saveGrowthCompanyProfile } from "@/lib/repository";

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function PUT(request: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = clean(body?.name, 120);
  if (name.length < 2) return NextResponse.json({ error: "Skriv inn et virksomhetsnavn." }, { status: 400 });
  const profile = await saveGrowthCompanyProfile({
    name, organizationNumber: clean(body?.organizationNumber, 40), location: clean(body?.location, 120),
    timezone: clean(body?.timezone, 80) || "Europe/Oslo", description: clean(body?.description, 1500)
  });
  return NextResponse.json({ profile });
}
