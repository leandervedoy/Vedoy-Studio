import { NextResponse } from "next/server";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { createContactRequest, createGrowthNotification } from "@/lib/repository";
import { listPublishedPrices } from "@/lib/vedoy-catalog";
import { sameOriginWrite } from "@/lib/vedoy-manager";
import { resolvePricingInquiry } from "@/lib/pricing-bridge.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const leadSchema = z.object({
  planCode: z.string().regex(/^[a-z0-9][a-z0-9_-]{1,69}$/),
  addonCode: z.string().regex(/^[a-z0-9][a-z0-9_-]{1,69}$/).optional(),
  companyName: z.string().trim().min(2).max(160),
  contactPerson: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  phone: z.string().trim().max(40).optional(),
  answers: z.array(z.number().int().min(0).max(4)).max(3),
  consent: z.literal(true),
  honeypot: z.literal(""),
  turnstileToken: z.string().max(5000).optional(),
});
const denied = (error: string, status = 422) => NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (!sameOriginWrite(request)) return denied("Ugyldig opphav.", 403);
  const len = Number(request.headers.get("content-length") || 0);
  if (!Number.isSafeInteger(len) || len > 12000) return denied("For mye data.", 413);
  const parsed = leadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return denied("Kontroller skjemaet, og prøv igjen.");
  const input = parsed.data;
  const email = input.email.trim().toLowerCase();

  try {
    // Reuse the existing Vedøy CRM. No second, unaudited lead store or server key.
    const sql = getSql();
    if (!sql) return denied("Forespørsler er midlertidig utilgjengelige.", 503);
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (secret) {
      if (!input.turnstileToken) return denied("Bekreft at du ikke er en robot.", 403);
      const challenge = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret,
          response: input.turnstileToken,
          remoteip: request.headers.get("x-real-ip") || ""
        }),
        signal: AbortSignal.timeout(8000),
        cache: "no-store"
      });
      const result: { success?: boolean } = await challenge.json().catch(() => ({}));
      if (!challenge.ok || result.success !== true) return denied("Botkontrollen mislyktes.", 403);
    }
    // Reuse Studio's durable contact_requests for a simple persisted quota.
    const counts = await sql<{ count: number }[]>`
      select count(*)::int as count from contact_requests
      where organization_id = ${"org_vedoy"} and lower(email) = ${email}
        and created_at >= now() - interval '1 hour'
    `;
    if (Number(counts[0]?.count || 0) >= 3) return denied("For mange forespørsler. Prøv igjen senere.", 429);

    // Never trust names, prices, or version numbers from the public browser.
    const prices = await listPublishedPrices();
    let inquiry: ReturnType<typeof resolvePricingInquiry>;
    try {
      inquiry = resolvePricingInquiry(input, prices);
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      return denied(code === "UNKNOWN_PLAN" ? "Den valgte pakken er ikke lenger tilgjengelig." : "Ugyldig pakke.", 409);
    }
    const answersText = input.answers.length ? "\nKalkulatorvalg: " + input.answers.join(", ") : "";
    const message = [inquiry.summary, answersText, "Samtykke: Kunden har bedt om å bli kontaktet. Ingen avtale er inngått."].filter(Boolean).join("\n\n");
    const id = await createContactRequest({
      name: input.contactPerson,
      company: input.companyName,
      email,
      phone: input.phone || undefined,
      need: "Prisforespørsel",
      message
    });
    // A notification failure cannot invalidate a lead already saved in the CRM.
    try {
      await createGrowthNotification({
        userEmail: process.env.ADMIN_EMAIL || "leander@vedoy.store",
        type: "lead",
        title: "Ny prisforespørsel",
        detail: `${input.companyName} ønsker ${inquiry.main.title}.`,
        href: "/studio/requests"
      });
    } catch (error) {
      console.error("pricing_notification_failed", error);
    }
    return NextResponse.json({ ok: true, id, message: "Forespørselen er lagret i Vedøy Studio." }, {
      status: 201,
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    console.error("pricing_inquiry_failed", error instanceof Error ? error.message : "unknown");
    return denied("Vi klarte ikke å lagre forespørselen. Prøv igjen senere.", 503);
  }
}
