import "server-only";
import { getStripe } from "@/lib/stripe";
import { AiError, uuid } from "./server";

export function billingReady() {
  return Boolean(process.env.AI_STRIPE_PRICE_ID && process.env.OPENAI_API_KEY && process.env.AI_PUBLIC_URL && process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_"));
}

export async function billingCustomer(userId: string) {
  uuid(userId);
  const result = await getStripe().customers.search({ query: `metadata['vedoy_ai_user_id']:'${userId}'`, limit: 10 });
  return result.data[0] || null;
}

export async function paidAccess(userId: string) {
  if (!billingReady()) return { active: false, customer: null };
  const customer = await billingCustomer(userId);
  if (!customer) return { active: false, customer: null };
  const subscriptions = await getStripe().subscriptions.list({ customer: customer.id, status: "all", limit: 100 });
  const active = subscriptions.data.some(subscription => subscription.status === "active" && subscription.items.data.some(item => item.price.id === process.env.AI_STRIPE_PRICE_ID));
  return { active, customer };
}

export function billingUrl() {
  const value = process.env.AI_PUBLIC_URL;
  if (!value) throw new AiError(503, "billing_unavailable");
  const url = new URL(value);
  if (url.protocol !== "https:") throw new AiError(503, "billing_unavailable");
  return url.origin + "/ai";
}
