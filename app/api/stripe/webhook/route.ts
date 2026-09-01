import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

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

  // Payment webhooks are accepted for signature validation, but they never provision
  // hosting or register domains. Those actions require a separate manual agreement.
  void event;

  return NextResponse.json({ received: true });
}
