import { NextResponse } from "next/server";
import { getIntegrationStatuses } from "@/lib/integration-status";

export async function GET() {
  return NextResponse.json({ integrations: await getIntegrationStatuses() });
}
