import { NextResponse } from "next/server";
import { getShopifyStatus } from "../../../lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const integration = getShopifyStatus();

  return NextResponse.json({
    service: "vedoy-shopify",
    ...integration,
    secretsExposed: false,
  });
}
