import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listGrowthNotifications, markGrowthNotificationsRead } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  return NextResponse.json({ notifications: await listGrowthNotifications(session.email) });
}

export async function PATCH() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  await markGrowthNotificationsRead(session.email);
  return NextResponse.json({ ok: true });
}
