import { aiContext, endpoint, AiError } from "@/lib/vedoy-ai/server";
import { billingReady, billingUrl, paidAccess } from "@/lib/vedoy-ai/billing";
import { getStripe } from "@/lib/stripe";

export function GET(request: Request) { return endpoint(async () => {
  const { user } = await aiContext(request);
  if (!billingReady()) return { available: false, active: false, aiAvailable: Boolean(process.env.OPENAI_API_KEY) };
  const [access, price] = await Promise.all([paidAccess(user.id), getStripe().prices.retrieve(process.env.AI_STRIPE_PRICE_ID!)]);
  return { available: price.active && Boolean(price.recurring), active: access.active, aiAvailable: true, amount: price.unit_amount, currency: price.currency, interval: price.recurring?.interval, intervalCount: price.recurring?.interval_count };
}); }

export function POST(request: Request) { return endpoint(async () => {
  const { user } = await aiContext(request);
  if (!billingReady()) throw new AiError(503, "billing_unavailable");
  const stripe = getStripe(), access = await paidAccess(user.id), returnUrl = billingUrl();
  if (access.active && access.customer) {
    const portal = await stripe.billingPortal.sessions.create({ customer: access.customer.id, return_url: returnUrl });
    return { url: portal.url };
  }
  const customer = access.customer || await stripe.customers.create({ email: user.email, metadata: { vedoy_ai_user_id: user.id } }, { idempotencyKey: `vedoy-ai-customer-${user.id}` });
  const open = await stripe.checkout.sessions.list({ customer: customer.id, status: "open", limit: 10 });
  const existing = open.data.find(session => session.metadata?.application === "vedoy-ai");
  if (existing?.url) return { url: existing.url };
  const session = await stripe.checkout.sessions.create({
    mode: "subscription", customer: customer.id, client_reference_id: user.id,
    line_items: [{ price: process.env.AI_STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${returnUrl}?billing=success`, cancel_url: `${returnUrl}?billing=cancel`,
    metadata: { application: "vedoy-ai" }, subscription_data: { metadata: { vedoy_ai_user_id: user.id } },
    billing_address_collection: "required", tax_id_collection: { enabled: true },
  }, { idempotencyKey: `vedoy-ai-checkout-${user.id}-${Math.floor(Date.now() / 1800000)}` });
  return { url: session.url };
}); }
