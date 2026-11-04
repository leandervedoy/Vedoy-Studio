import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { privilegedSupabase, sameOriginWrite } from "@/lib/vedoy-manager";
export const runtime = "nodejs";
const leadSchema = z.object({
  planCode: z.string().regex(/^[a-z0-9_-]{2,70}$/),
  addonCode: z.string().regex(/^[a-z0-9_-]{2,70}$/).optional(),
  companyName: z.string().trim().min(2).max(160),
  contactPerson: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  phone: z.string().trim().max(40).optional(),
  answers: z.array(z.number().int().min(0).max(4)).max(3),
  consent: z.literal(true),
  honeypot: z.literal(""),
  turnstileToken: z.string().min(10).max(5000)
});
function failed(message: string, status = 422) { return NextResponse.json({ error: message }, { status }); }
export async function POST(request: Request) {
  if (!sameOriginWrite(request)) return failed("Ugyldig opphav.", 403);
  const limit = Number(request.headers.get("content-length") || 0);
  if (limit > 12000) return failed("For mye data.", 413);
  const parsed = leadSchema.safeParse(await request.json().catch(()=>null));
  if (!parsed.success) return failed("Kontroller skjemafeltene.");
  const input = parsed.data;
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  const hashSecret = process.env.VEDOY_PRICING_HASH_SECRET;
  if (!turnstileSecret || !hashSecret || hashSecret.length < 32 || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
    return failed("Forespørsler er midlertidig utilgjengelige.", 503);
  }
  const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipHash = createHmac("sha256", hashSecret).update(ip).digest("hex");
  try {
    const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: turnstileSecret, response: input.turnstileToken, remoteip: ip }),
      signal: AbortSignal.timeout(8000), cache: "no-store"
    });
    const challenge: { success?: boolean } = await verify.json().catch(()=>({}));
    if (!verify.ok || challenge.success !== true) return failed("Bekreft at du ikke er en robot.", 403);
    const db = privilegedSupabase();
    const since = new Date(Date.now()-60*60*1000).toISOString();
    const { count, error: countError } = await db.from("vedoy_pricing_leads")
      .select("id", { count: "exact", head: true }).eq("ip_hash",ipHash).gte("created_at", since);
    if (countError) throw countError;
    if ((count || 0) >= 5) return failed("For mange henvendelser. Prøv igjen senere.", 429);
    const codes = [input.planCode, ...(input.addonCode ? [input.addonCode] : [])];
    const { data: plans, error: planError } = await db.from("vedoy_price_catalog")
      .select("code,title,amount_ore,setup_ore,billing_period,currency,vat_mode,version")
      .in("code",codes).eq("published",true);
    if (planError) throw planError;
    if (!plans || plans.length !== codes.length || new Set(codes).size !== codes.length) return failed("Valgte priser er ikke tilgjengelige.",409);
    const { error } = await db.from("vedoy_pricing_leads").insert({
      plan_code: input.planCode, plan_snapshot: plans, company_name: input.companyName,
      contact_person: input.contactPerson, email: input.email.trim().toLowerCase(), phone: input.phone || null,
      quiz_data: { answers: input.answers }, ip_hash: ipHash
    });
    if (error) throw error;
    return NextResponse.json({ ok: true, message: "Forespørselen er registrert." }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Pricing lead submission failed", error instanceof Error ? error.message : "unknown");
    return failed("Kunne ikke lagre forespørselen. Prøv igjen senere.", 503);
  }
}
