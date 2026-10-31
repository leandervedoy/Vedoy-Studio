import { NextResponse } from "next/server";
import { PRINT_PRODUCTS, outputPixels } from "../../../../lib/print-engine/core";
export const dynamic = "force-static";
export function GET() { return NextResponse.json({ version: 1, products: PRINT_PRODUCTS.map(p => ({ ...p, pixels: outputPixels(p) })) }); }
