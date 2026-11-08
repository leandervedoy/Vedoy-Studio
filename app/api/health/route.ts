import { NextResponse } from "next/server";
import { getPlatformHealth } from "@/lib/platform-health";

export const dynamic = "force-dynamic";

/** Public, credential-free health endpoint for uptime checks. */
export async function GET() {
  const report = await getPlatformHealth();
  return NextResponse.json(report, {
    headers: { "Cache-Control": "no-store, max-age=0" }
  });
}
