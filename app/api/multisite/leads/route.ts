import { NextResponse } from "next/server";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { createContactRequest, createGrowthNotification } from "@/lib/repository";
import { listPublishedPrices } from "@/lib/vedoy-catalog";
import { sameOriginWrite } from "@/lib/vedoy-manager";
import { MULTISITE_ADDON_CODES, MULTISITE_FEATURES, MULTISITE_SECTORS, calculateMultisiteQuote } from "@/lib/multisite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  sector: z.enum(MULTISITE_SECTORS.map(s => s.id) as [string, ...string[]]),
  featureIds: z.array(z.enum(MULTISITE_FEATURES.map(f => f.id) as [string, ...string[]])).max(8).refine(ids => new Set(ids).size === ids.length),
  addonCode: z.union([z.literal(""), z.enum(MULTISITE_ADDON_CODES)]).default(""),
  businessName: z.string().trim().min(2).max(120),
  contactPerson: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  phone: z.string().trim().max(40).optional().default(""),
  tagline: z.string().trim().max(180).optional().default(""),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  budget: z.enum(["unsure", "low", "mid", "high"]).default("unsure"),
  websiteStatus: z.enum(["new", "replace", "improve"]).default("new"),
  source: z.string().trim().max(80).regex(/^[a-zA-Z0-9._-]*$/).optional().default(""),
  priceVersions: z.array(z.object({ code: z.string(), version: z.number().int().positive() })).max(12),
  consent: z.literal(true),
  marketingConsent: z.boolean().default(false),
  honeypot: z.literal(""),
  turnstileToken: z.string().max(5000).optional().default("")
});
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

async function verifyTurnstile(token: string, request: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || !token) return false;
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token, remoteip: request.headers.get("x-real-ip") || "" }),
    signal: AbortSignal.timeout(8000), cache: "no-store"
  });
  const result: { success?: boolean } = await response.json().catch(() => ({}));
  return response.ok && result.success === true;
}
export async function POST(request: Request) {
  if (!sameOriginWrite(request)) return fail("Ugyldig opphav.", 403);
  const size = Number(request.headers.get("content-length") || 0);
  if (!Number.isSafeInteger(size) || size > 12000) return fail("For mye data.", 413);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail("Kontroller opplysningene i skjemaet.", 422);
  const input = parsed.data;
  const email = input.email.toLowerCase().trim();
  try {
    const sql = getSql();
    if (!sql) return fail("Lagring er midlertidig utilgjengelig.", 503);
    if (!await verifyTurnstile(input.turnstileToken, request)) return fail("Botkontrollen er ikke tilgjengelig eller ble ikke godkjent.", 403);
    const counts = await sql`select count(*)::int as count from contact_requests where organization_id = ${"org_vedoy"} and lower(email) = ${email} and created_at >= now() - interval '1 hour'`;
    if (Number(counts[0]?.count || 0) >= 3) return fail("For mange henvendelser. Prøv igjen senere.", 429);
    const quote = calculateMultisiteQuote(await listPublishedPrices(), input.featureIds, input.addonCode);
    const expected = new Map(input.priceVersions.map(entry => [entry.code, entry.version]));
    if (expected.size !== quote.versions.length || quote.versions.some(entry => expected.get(entry.code) !== entry.version))
      return fail("Prislisten er oppdatert. Last inn siden på nytt for å se gjeldende priser.", 409);
    const sector = MULTISITE_SECTORS.find(s => s.id === input.sector);
    const featureNames = input.featureIds.map(id => MULTISITE_FEATURES.find(f => f.id === id)?.title).filter(Boolean);
    const fmt = (ore: number) => (ore / 100).toFixed(2) + " NOK";
    const message = [
      "Kilde: Vedøy Multisite · behovsveiviser (ingen ordre)",
      "Bransje: " + (sector?.name || input.sector),
      "Nettside: " + input.websiteStatus,
      "Valgte funksjoner: " + (featureNames.join(", ") || "Ingen tillegg"),
      "Farge: " + input.brandColor,
      "Kort beskrivelse: " + (input.tagline || "Ikke oppgitt"),
      "Budsjettindikasjon: " + input.budget,
      "Kampanje: " + (input.source || "direkte"),
      "Pakker: " + quote.lines.map(l => l.title + " (" + l.code + ")").join(", "),
      "Anslag per måned: " + fmt(quote.monthlyOre),
      "Engangsbeløp: " + fmt(quote.oneTimeOre),
      "Etablering: " + fmt(quote.setupOre),
      "MVA-modus: " + quote.vatMode,
      "Katalogversjoner: " + quote.versions.map(x => x.code + "=" + x.version).join(", "),
      "Spesialtilpasninger som krever eget tilbud: " + (quote.custom.map(x => x.title).join(", ") || "Ingen"),
      "Kontaktforespørsel: Ja. Markedsføringssamtykke: " + (input.marketingConsent ? "Ja" : "Nei"),
      "Uforpliktende: Ja. Kundens opplastede logo er ikke lagret."
    ].join("\n");
    const id = await createContactRequest({
      name: input.contactPerson, company: input.businessName, email,
      phone: input.phone || undefined, need: "Multisite nettsidetilbud", message
    });
    try {
      await createGrowthNotification({
        userEmail: process.env.ADMIN_EMAIL || "leander@vedoy.store",
        type: "lead", title: "Ny Multisite-forespørsel",
        detail: input.businessName + " ønsker " + (sector?.name || "nettside") + ".",
        href: "/studio/requests"
      });
    } catch (error) {
      console.error("multisite_notification_failed", error instanceof Error ? error.message : "unknown");
    }
    return NextResponse.json({ ok: true, id, message: "Forespørselen er lagret. Vedøy Studio tar kontakt." }, {
      status: 201, headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    console.error("multisite_lead_failed", error instanceof Error ? error.message : "unknown");
    return fail("Vi kunne ikke lagre forespørselen. Prøv igjen senere.", 503);
  }
}
