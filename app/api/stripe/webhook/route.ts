import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { fulfillHostingOrder } from "@/lib/fulfillment";
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

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    try {
      const session = await getStripe().checkout.sessions.retrieve((event.data.object as Stripe.Checkout.Session).id);
      if (session.metadata?.order_type === "managed_hosting") await fulfillHostingOrder(session);
    } catch (reason) {
      console.error("Hosting fulfillment failed", reason);
      return NextResponse.json({ error: "Ordren kunne ikke klargjøres." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
