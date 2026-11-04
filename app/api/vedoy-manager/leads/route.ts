import { NextResponse } from "next/server";
import { managerSession, privilegedSupabase, publicError } from "@/lib/vedoy-manager";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!await managerSession()) return NextResponse.json({ error: "Ikke funnet." }, { status: 404 });
  try {
    const { data, error } = await privilegedSupabase().from("vedoy_pricing_leads")
      .select("id,created_at,plan_code,company_name,contact_person,email,phone,status,quiz_data")
      .order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    return NextResponse.json({ leads: data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return NextResponse.json(publicError(error), { status: 503 }); }
}
