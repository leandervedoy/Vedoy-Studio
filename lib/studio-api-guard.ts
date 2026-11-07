import "server-only";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { hasVerifiedStaffSession } from "@/lib/staff-access";
import { sameOriginWrite } from "@/lib/vedoy-manager";

/** Explicit authorization required before reading or modifying internal org_vedoy data. */
export async function enforceInternalApi(request?: Request): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Ikke innlogget." }, {
      status: 401, headers: { "Cache-Control": "no-store" }
    });
  }
  if (!(await hasVerifiedStaffSession(session))) {
    return NextResponse.json({ error: "Ingen tilgang." }, {
      status: 403, headers: { "Cache-Control": "no-store" }
    });
  }
  if (request && !["GET", "HEAD", "OPTIONS"].includes(request.method) && !sameOriginWrite(request)) {
    return NextResponse.json({ error: "Ugyldig opphav." }, { status: 403 });
  }
  return null;
}
