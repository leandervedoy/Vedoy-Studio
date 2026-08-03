import { NextResponse } from "next/server";
import { searchDomains } from "@/lib/domain-search";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query")?.slice(0, 80) ?? "";
  if (query.trim().length < 2) {
    return NextResponse.json({ error: "Skriv minst to tegn." }, { status: 400 });
  }
  return NextResponse.json({ results: searchDomains(query), provider: "demo" });
}
