import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getGrowthPreferences, saveGrowthPreferences } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  return NextResponse.json({ preferences: await getGrowthPreferences(session.email), emailConfigured: Boolean(process.env.RESEND_API_KEY) });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Ugyldige innstillinger." }, { status: 400 });
  const preferences = await saveGrowthPreferences(session.email, {
    inAppNotifications: body.inAppNotifications !== false,
    emailBooking: body.emailBooking !== false,
    emailSystem: body.emailSystem !== false,
    dailyDigest: body.dailyDigest === true
  });
  return NextResponse.json({ preferences, emailConfigured: Boolean(process.env.RESEND_API_KEY) });
}
