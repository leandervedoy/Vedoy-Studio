import { NextResponse } from "next/server";
import { getGigahostOffers, quoteOffer, gigahostCheckoutReady } from "@/lib/gigahost";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { offers, regions } = await getGigahostOffers();
    return NextResponse.json({
      offers: offers.map((offer) => ({
        productId: offer.productId, priceId: offer.priceId, name: offer.name,
        type: offer.type, cores: offer.cores, cpuModel: offer.cpuModel,
        ramGb: offer.ramGb, storageGb: offer.storageGb,
        regions: regions.filter((region) => offer.regionIds.includes(region.id)),
        monthlyNok: offer.monthlyNok,
        setupNok: offer.setupNok,
        backupMonthlyNok: offer.backupsAvailable ? quoteOffer(offer, true).retailMonthlyNok - offer.monthlyNok : 0,
        canCheckout: offer.canCheckout && gigahostCheckoutReady()
      })),
      checkoutEnabled: gigahostCheckoutReady(),
      note: "Alle priser i NOK eks. mva. Pris og tilgjengelighet kontrolleres ved bestilling."
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("gigahost_catalog_unavailable", error instanceof Error ? error.message : "error");
    return NextResponse.json({ error: "Leverandørkatalogen er utilgjengelig." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
