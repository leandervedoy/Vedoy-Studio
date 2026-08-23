import "server-only";
import Stripe from "stripe";

let stripeClient: Stripe | undefined;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Stripe er ikke konfigurert.");
  stripeClient ??= new Stripe(secretKey);
  return stripeClient;
}

export function getStripeMode(): "live" | "test" | "unavailable" {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return "unavailable";
  return secretKey.startsWith("sk_live_") ? "live" : "test";
}
