import { NextResponse } from "next/server";
import { isUsingDatabase } from "@/lib/repository";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "vedoy-studio",
    database: isUsingDatabase() ? "postgres" : "demo-memory",
    time: new Date().toISOString()
  });
}
