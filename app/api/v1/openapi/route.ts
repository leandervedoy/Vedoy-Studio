import { NextResponse } from "next/server";
import { openApiDocument } from "@/lib/platform/contracts";
export const dynamic = "force-dynamic";
export function GET() { return NextResponse.json(openApiDocument, { headers: { "cache-control": "public, max-age=300" } }); }
