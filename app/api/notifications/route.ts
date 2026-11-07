import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { enforceInternalApi } from "@/lib/studio-api-guard";
import { listGrowthNotifications, markGrowthNotificationsRead } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await enforceInternalApi();
  if (access) return access;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  try {
    return NextResponse.json({ notifications: await listGrowthNotifications(session.email) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Varsler er midlertidig utilgjengelige." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const access = await enforceInternalApi(request);
  if (access) return access;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  try {
    await markGrowthNotificationsRead(session.email);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Kunne ikke oppdatere varsler." }, { status: 503 });
  }
}
