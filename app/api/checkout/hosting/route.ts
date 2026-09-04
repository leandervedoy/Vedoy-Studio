import { NextResponse } from "next/server";
import { calculateHostingPrice, normalizeHostingSelection } from "@/lib/hosting-catalog";
import { createContactRequest } from "@/lib/repository";
import { getDomainQuote } from "@/lib/vercel-domains";

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host")?.split(",")[0].trim() || request.headers.get("host") || new URL(request.url).host;
  return new URL(origin).host.toLowerCase() === host.toLowerCase();
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 403 });
  try {
    const body = await request.json() as { name?: string; email?: string; company?: string; phone?: string; [key: string]: unknown };
    if (!body.name?.trim() || !body.email?.trim() || !/^\S+@\S+\.\S+$/.test(body.email)) return NextResponse.json({ error: "Navn og en gyldig e-postadresse er påkrevd." }, { status: 400 });
    const selection = normalizeHostingSelection(body as Partial<import("@/lib/hosting-catalog").HostingSelection>);
    const price = calculateHostingPrice(selection);
    const domainQuote = selection.domainMode === "new" && selection.domain ? await getDomainQuote(selection.domain) : null;
    if (domainQuote && !domainQuote.available) return NextResponse.json({ error: "Domenet er ikke lenger tilgjengelig. Søk på nytt." }, { status: 409 });
    const configuration = [`${selection.serverCount} server(e)`, `${selection.ramGb} GB RAM`, `${selection.storageGb} GB lagring`, `region ${selection.region}`, selection.backups ? "daglig backup" : "uten backup", selection.domain ? `domene: ${selection.domain}` : "uten domene", `estimert ${price.monthlyNok} NOK/mnd. + ${price.setupNok} NOK etablering`].join(" · ");
    const requestId = await createContactRequest({ name: body.name.trim(), email: body.email.trim(), company: body.company?.trim() || undefined, phone: body.phone?.trim() || undefined, need: "Hosting & domene", message: `${configuration}\n\nDette er en manuell bestilling som må gjennomgås og godkjennes før oppstart.` , status: "pending" });
    return NextResponse.json({ requestId }, { status: 201 });
  } catch (reason) {
    return NextResponse.json({ error: reason instanceof Error ? reason.message : "Bestillingen kunne ikke sendes." }, { status: 400 });
  }
}
