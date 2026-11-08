import { getPlatformHealth } from "@/lib/platform-health";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return NextResponse.json(await getPlatformHealth(), {
    headers: { "cache-control": "no-store, max-age=0", "x-request-id": request.headers.get("x-request-id") || crypto.randomUUID() }
  });
}
