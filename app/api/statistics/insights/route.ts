import { NextResponse } from "next/server";
import { sameOriginWrite, privilegedSupabase } from "@/lib/vedoy-manager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };
const GOALS = ["learn", "test", "explore"];
const LEVELS = ["beginner", "some", "advanced"];
const DEPTHS = ["brief", "standard", "deep"];

/** Vedoy Monetize / Statistics opt-in aggregated Insights preferences.
 * Collect only three bounded categories. No visitor ID, user account, IP,
 * individual quiz answers, client timestamps or free text is written.
 * A client-provided consent flag is not evidence of legal consent.
 * Totals are voluntarily reported and not fraud-resistant.
 */
export async function POST(request: Request) {
  if (!sameOriginWrite(request)) {
    return NextResponse.json({ error: "Ugyldig opprinnelse." }, { status: 403, headers: NO_STORE });
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ error: "JSON kreves." }, { status: 415, headers: NO_STORE });
  }
  if (Number(request.headers.get("content-length") || 0) > 512) {
    return new NextResponse(null, { status: 413, headers: NO_STORE });
  }
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") return new NextResponse(null, { status: 400, headers: NO_STORE });
    const data = body as Record<string, unknown>;
    if (data.consent !== true) return new NextResponse(null, { status: 204, headers: NO_STORE });
    if (!GOALS.includes(String(data.goal)) || !LEVELS.includes(String(data.level)) || !DEPTHS.includes(String(data.depth))) {
      return NextResponse.json({ error: "Ugyldige valg." }, { status: 400, headers: NO_STORE });
    }
    const { data: recorded, error } = await privilegedSupabase().rpc("statistics_record_insights_preference", {
      p_goal: data.goal, p_level: data.level, p_depth: data.depth,
    });
    if (error || recorded !== true) return NextResponse.json({ error: "Statistikken er utilgjengelig." }, { status: 503, headers: NO_STORE });
    return new NextResponse(null, { status: 204, headers: NO_STORE });
  } catch {
    return NextResponse.json({ error: "Kunne ikke registrere bidrag." }, { status: 503, headers: NO_STORE });
  }
}
