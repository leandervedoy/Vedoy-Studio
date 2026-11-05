import { NextResponse, type NextRequest } from "next/server";

// Forward only the verified request pathname. This is not an auth check.
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-vedoy-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = { matcher: ["/studio/:path*"] };
