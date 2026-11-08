import { NextResponse, type NextRequest } from "next/server";

const rateWindows = new Map<string, { started: number; count: number }>();

function allowedRequest(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/") || !["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) return true;
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host.toLowerCase() !== request.headers.get("x-forwarded-host")?.split(",")[0].trim().toLowerCase() && new URL(origin).host.toLowerCase() !== request.headers.get("host")?.toLowerCase()) return false;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const bucketKey = `${ip}:${request.nextUrl.pathname}`; const now = Date.now();
  const current = rateWindows.get(bucketKey);
  const bucket = current && now - current.started < 60_000 ? current : { started: now, count: 0 };
  bucket.count += 1; rateWindows.set(bucketKey, bucket);
  return bucket.count <= 120;
}

// Forward only the verified request pathname. This is not an auth check.
export function proxy(request: NextRequest) {
  if (!allowedRequest(request)) return NextResponse.json({ error: "Forespørselen ble avvist." }, { status: 403 });
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-vedoy-pathname", request.nextUrl.pathname);
  requestHeaders.set("x-request-id", request.headers.get("x-request-id") || crypto.randomUUID());
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("x-request-id", requestHeaders.get("x-request-id")!);
  return response;
}

export const config = { matcher: ["/studio/:path*", "/api/:path*"] };
