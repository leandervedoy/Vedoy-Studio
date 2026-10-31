import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export function GET() {
  return NextResponse.json({
    service: "vedoy-print-engine",
    editor: "available",
    export: "browser-only",
    shopifyInstallation: "not_implemented",
    fulfilment: "disabled",
    providers: { gelato: "not_connected", prodigi: "not_connected", printify: "not_connected", printful: "not_connected" }
  }, { headers: { "Cache-Control": "no-store" } });
}
