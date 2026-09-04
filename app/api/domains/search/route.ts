import { NextResponse } from "next/server";
import { searchDomains } from "@/lib/vercel-domains";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query")?.slice(0, 80) ?? "";
  if (query.trim().length < 2) {
    return NextResponse.json({ error: "Skriv minst to tegn." }, { status: 400 });
  }
  try {
    return NextResponse.json({ results: await searchDomains(query), provider: "vercel-registrar" });
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : "Domenesøket feilet.";
    if (message === "DOMAIN_PROVIDER_NOT_CONFIGURED") {
      return NextResponse.json({ error: "Domenekjøp er ikke aktivert ennå. Kontakt Vedøy Studio eller prøv igjen senere." }, { status: 503 });
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
