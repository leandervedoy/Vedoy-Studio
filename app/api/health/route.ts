import { NextResponse, type NextRequest } from "next/server";
import { getPlatformHealth } from "@/lib/platform-health";

export const dynamic = "force-dynamic";

/** Public, credential-free health endpoint for uptime checks. */
export async function GET(request: NextRequest) {
  const report = await getPlatformHealth();
  return NextResponse.json(report, {
    headers: { "Cache-Control": "no-store, max-age=0", "x-request-id": request.headers.get("x-request-id") || crypto.randomUUID() }
  });
}
