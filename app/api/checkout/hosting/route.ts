import { NextResponse } from "next/server";
import { calculateHostingPrice, normalizeHostingSelection } from "@/lib/hosting-catalog";
import { getStripe } from "@/lib/stripe";
import { getDomainQuote } from "@/lib/vercel-domains";

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
  const requestHost = forwardedHost || request.headers.get("host") || new URL(request.url).host;
  return new URL(origin).host.toLowerCase() === requestHost.toLowerCase();
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 403 });

  try {
    const selection = normalizeHostingSelection(await request.json());
    const price = calculateHostingPrice(selection);
    const domainQuote = selection.domainMode === "new" && selection.domain ? await getDomainQuote(selection.domain) : null;
    if (domainQuote && !domainQuote.available) return NextResponse.json({ error: "Domenet er ikke lenger tilgjengelig. Søk på nytt." }, { status: 409 });

    const stripe = getStripe();
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const metadata = {
      order_type: "managed_hosting",
      server_count: String(selection.serverCount),
      ram_gb: String(selection.ramGb),
      storage_gb: String(selection.storageGb),
      region: selection.region,
      backups: selection.backups ? "true" : "false",
      domain_mode: selection.domainMode,
      domain: selection.domain || ""
    };

    const lineItems = [
      {
        price_data: {
          currency: "nok",
          product_data: { name: `Administrert hosting · ${selection.serverCount} ${selection.serverCount === 1 ? "server" : "servere"}`, description: `${selection.ramGb} GB RAM og ${selection.storageGb} GB lagring per server${selection.backups ? ", daglig backup" : ""}` },
          recurring: { interval: "month" as const },
          tax_behavior: "exclusive" as const,
          unit_amount: price.monthlyNok * 100
        },
        quantity: 1
      },
      {
        price_data: {
          currency: "nok",
          product_data: { name: "Etablering og sikker grunnkonfigurasjon", description: "Klargjøring, tilgang, DNS/SSL og produksjonskontroll." },
          tax_behavior: "exclusive" as const,
          unit_amount: price.setupNok * 100
        },
        quantity: 1
      },
      ...(domainQuote ? [{
        price_data: {
          currency: "nok",
          product_data: { name: `Domene · ${domainQuote.domain}`, description: "Registrering første år. Automatisk fornyelse avtales separat." },
          tax_behavior: "exclusive" as const,
          unit_amount: domainQuote.annualPriceNok * 100
        },
        quantity: 1
      }] : [])
    ];

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: lineItems,
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      tax_id_collection: { enabled: true },
      automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === "true" },
      allow_promotion_codes: true,
      custom_fields: [
        { key: "company", label: { type: "custom", custom: "Bedriftsnavn" }, type: "text", optional: false },
        { key: "organization_number", label: { type: "custom", custom: "Organisasjonsnummer" }, type: "numeric", optional: false }
      ],
      metadata,
      subscription_data: { metadata },
      success_url: `${origin}/bestilling/fullfort?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/tjenester/hosting-og-domene?avbrutt=1`
    });

    if (!session.url) throw new Error("Stripe returnerte ingen betalingsadresse.");
    return NextResponse.json({ url: session.url });
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : "Betalingen kunne ikke startes.";
    const status = message === "Stripe er ikke konfigurert." ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
