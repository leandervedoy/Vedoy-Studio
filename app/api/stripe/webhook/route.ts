import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { markBookingPayment } from "@/lib/repository";

async function handleCheckoutSession(session: Stripe.Checkout.Session, status: "paid" | "failed") {
  if (session.metadata?.application !== "vedoy-booking") return;
  const bookingId = session.metadata.booking_id;
  if (!bookingId) return;
  if (status === "paid" && session.payment_status === "unpaid") return;
  await markBookingPayment(bookingId, {
    paymentStatus: status,
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
    paidAt: status === "paid" ? new Date().toISOString() : undefined
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "Webhook er ikke konfigurert." }, { status: 503 });
  if (!signature) return NextResponse.json({ error: "Ugyldig webhook-signatur." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Ugyldig webhook-signatur." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    await handleCheckoutSession(event.data.object, "paid");
  }
  if (event.type === "checkout.session.async_payment_failed") {
    await handleCheckoutSession(event.data.object, "failed");
  }

  return NextResponse.json({ received: true });
}