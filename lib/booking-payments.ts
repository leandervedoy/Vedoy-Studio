import "server-only";
import { randomBytes } from "node:crypto";
import type Stripe from "stripe";
import { bookingServices } from "@/lib/booking-config";
import { getStripe } from "@/lib/stripe";
import type { StudioBooking } from "@/lib/types";

const INTEGRATION_PREFIX = "vedoy_booking";

export function bookingPaymentsReady(): boolean {
  return process.env.STRIPE_BOOKING_PAYMENTS_ENABLED === "true" && Boolean(process.env.STRIPE_SECRET_KEY && bookingPublicUrl());
}

export function bookingPublicUrl(): string | null {
  const explicit = process.env.BOOKING_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.AI_PUBLIC_URL;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "";
  const value = explicit || vercel;
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && process.env.NODE_ENV === "production") return null;
    return url.origin;
  } catch {
    return null;
  }
}

function integrationIdentifier() {
  return `${INTEGRATION_PREFIX}_${randomBytes(4).toString("hex")}`;
}

export async function createBookingCheckoutSession(booking: StudioBooking): Promise<Stripe.Checkout.Session | null> {
  if (!bookingPaymentsReady()) return null;
  const service = bookingServices.find((item) => item.id === booking.serviceId);
  const amount = booking.paymentAmountNok ?? service?.price;
  if (!amount || amount < 1) return null;
  const origin = bookingPublicUrl();
  if (!origin) return null;

  const params: Stripe.Checkout.SessionCreateParams & { integration_identifier?: string } = {
    mode: "payment",
    customer_email: booking.customerEmail,
    client_reference_id: booking.id,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: (service?.currency || "NOK").toLowerCase(),
        unit_amount: Math.round(amount * 100),
        product_data: {
          name: booking.serviceName,
          description: new Intl.DateTimeFormat("nb-NO", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Oslo" }).format(new Date(booking.startsAt))
        }
      }
    }],
    success_url: `${origin}/bestilling/fullfort?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/booking?betaling=avbrutt`,
    metadata: { application: "vedoy-booking", booking_id: booking.id },
    payment_intent_data: { metadata: { application: "vedoy-booking", booking_id: booking.id } },
    billing_address_collection: "auto",
    integration_identifier: integrationIdentifier()
  };

  return getStripe().checkout.sessions.create(params, { idempotencyKey: `vedoy-booking-checkout-${booking.id}` });
}