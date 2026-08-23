import "server-only";
import { getStripe } from "@/lib/stripe";

export type IntegrationHealth = "healthy" | "not_configured" | "misconfigured" | "degraded" | "unavailable";

export interface IntegrationStatus {
  id: string;
  name: string;
  status: IntegrationHealth;
  detail: string;
  demo: boolean;
}

function hasValue(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

export async function getIntegrationStatuses(): Promise<IntegrationStatus[]> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const stripePrice = process.env.STRIPE_BOOKING_PRO_PRICE_ID;
  const stripeWebhook = process.env.STRIPE_WEBHOOK_SECRET;
  let stripe: IntegrationStatus = {
    id: "stripe",
    name: "Stripe",
    status: "not_configured",
    detail: "Demo: Stripe-nøkler og Booking Pro Price ID mangler.",
    demo: true
  };

  if ([stripeKey, stripePrice, stripeWebhook].some(Boolean) && ![stripeKey, stripePrice, stripeWebhook].every(hasValue)) {
    stripe = { ...stripe, status: "misconfigured", detail: "Stripe er delvis konfigurert. Legg inn secret key, Booking Pro Price ID og webhook secret.", demo: true };
  } else if (hasValue(stripeKey) && hasValue(stripePrice) && hasValue(stripeWebhook)) {
    try {
      await getStripe().balance.retrieve();
      stripe = { id: "stripe", name: "Stripe", status: "healthy", detail: "Stripe API svarer. Betalinger kan aktiveres etter webhook-test.", demo: false };
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String(error.code) : "unknown";
      const status = ["authentication_error", "invalid_api_key"].includes(code) ? "misconfigured" : code === "api_connection_error" ? "degraded" : "unavailable";
      stripe = { id: "stripe", name: "Stripe", status, detail: `Stripe svarte med ${code}. Se Stripe Status ved leverandørfeil.`, demo: true };
    }
  }

  return [
    stripe,
    { id: "google-calendar", name: "Google Calendar", status: hasValue(process.env.GOOGLE_CALENDAR_CLIENT_ID) ? "degraded" : "not_configured", detail: hasValue(process.env.GOOGLE_CALENDAR_CLIENT_ID) ? "OAuth er påbegynt, men kalenderkonto må kobles." : "Demo: Google Calendar er ikke koblet.", demo: true },
    { id: "microsoft-calendar", name: "Microsoft Calendar", status: hasValue(process.env.MICROSOFT_CLIENT_ID) ? "degraded" : "not_configured", detail: hasValue(process.env.MICROSOFT_CLIENT_ID) ? "OAuth er påbegynt, men kalenderkonto må kobles." : "Demo: Microsoft Calendar er ikke koblet.", demo: true },
    { id: "notifications", name: "E-post og SMS", status: hasValue(process.env.RESEND_API_KEY) || hasValue(process.env.TWILIO_ACCOUNT_SID) ? "degraded" : "not_configured", detail: "Demo: varsler logges internt til leverandør er konfigurert.", demo: true },
    { id: "shopify", name: "Shopify", status: hasValue(process.env.SHOPIFY_ADMIN_ACCESS_TOKEN) ? "degraded" : "not_configured", detail: "Demo: Shopify-produkter og ordre er ikke koblet.", demo: true }
  ];
}
