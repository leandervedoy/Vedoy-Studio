import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sameOriginWrite, privilegedSupabase } from "@/lib/vedoy-manager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const POLICY_VERSION = "studio-voluntary-2026-11-v1";
const SITE_ID = "vedoy_studio";
const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ linked: false }, { headers: NO_STORE });
  try {
    const { data, error } = await privilegedSupabase().from("insight_site_consent_events")
      .select("choices,recorded_at").eq("user_id",session.userId).eq("site_id",SITE_ID)
      .order("recorded_at",{ascending:false}).limit(1).maybeSingle();
    if (error) throw error;
    return NextResponse.json({ linked:true, choices:data?.choices ?? null, recordedAt:data?.recorded_at ?? null },{ headers:NO_STORE });
  } catch {
    return NextResponse.json({ linked: false },{ headers:NO_STORE });
  }
}

export async function POST(request: Request) {
  if (!sameOriginWrite(request)) return NextResponse.json({ error:"Ugyldig forespørsel." },{ status:403,headers:NO_STORE });
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ linked:false },{ status:401,headers:NO_STORE });
  if (Number(request.headers.get("content-length") || 0) > 1024) return new NextResponse(null,{ status:413 });
  try {
    const body = await request.json();
    if (typeof body?.analytics !== "boolean" || typeof body?.researchReports !== "boolean" || body.researchReports && !body.analytics) {
      return NextResponse.json({ error:"Ugyldige samtykkevalg." },{ status:400,headers:NO_STORE });
    }
    const choices = { analytics:body.analytics, personalization:false, researchReports:body.researchReports };
    const source = !choices.analytics ? "reject" : choices.researchReports ? "all" : "custom";
    const { error } = await privilegedSupabase().from("insight_site_consent_events").insert({
      user_id:session.userId,site_id:SITE_ID,policy_version:POLICY_VERSION,choices,source
    });
    if (error) throw error;
    return NextResponse.json({ saved:true,linked:true },{ headers:NO_STORE });
  } catch {
    return NextResponse.json({ error:"Kunne ikke lagre kontovalget." },{ status:503,headers:NO_STORE });
  }
}
