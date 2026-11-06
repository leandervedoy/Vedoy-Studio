import { NextResponse } from "next/server";
import { listPublishedPrices } from "@/lib/vedoy-catalog";
import { calculateMultisiteQuote } from "@/lib/multisite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public preview endpoint. All amounts originate in the published Developer Portal catalog. */
export async function GET() {
  try {
    const prices = await listPublishedPrices();
    const base = calculateMultisiteQuote(prices, []);
    const priceItems = prices.filter(p => p.code === "nettside-drift" ||
      p.code === "sikkerhet" || p.code === "totalpartner" ||
      p.code.startsWith("multisite-"));
    return NextResponse.json({ prices: priceItems, base }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    console.error("multisite_catalog_unavailable", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Prislisten er midlertidig utilgjengelig. Prøv igjen senere." }, {
      status: 503, headers: { "Cache-Control": "no-store" }
    });
  }
}
