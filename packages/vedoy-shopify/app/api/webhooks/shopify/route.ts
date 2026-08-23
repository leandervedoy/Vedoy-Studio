import { NextResponse } from "next/server";
import { getShopifyConfig, getShopifyStatus } from "../../../../lib/config";
import {
  isAllowedShopifyTopic,
  normalizeShopifyPayload,
  readShopifyWebhookHeaders,
  verifyShopifyWebhook,
} from "../../../../lib/webhooks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rawBody = Buffer.from(await request.arrayBuffer());
  const headers = readShopifyWebhookHeaders(request.headers);
  const status = getShopifyStatus();

  if (status.missing.length > 0) {
    return NextResponse.json(
      { error: "Shopify-integrasjonen er ikke konfigurert.", missing: status.missing },
      { status: 503 },
    );
  }

  const config = getShopifyConfig();

  if (!verifyShopifyWebhook(rawBody, headers.hmac, config.apiSecret)) {
    return NextResponse.json({ error: "Ugyldig Shopify-signatur." }, { status: 401 });
  }

  if (!headers.deliveryId || !headers.shopDomain || !isAllowedShopifyTopic(headers.topic)) {
    return NextResponse.json({ error: "Mangler eller støtter ikke Shopify-webhook-metadata." }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return NextResponse.json({ error: "Webhook-kroppen er ikke gyldig JSON." }, { status: 400 });
  }

  const forwardResponse = await fetch(config.growthWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.growthWebhookToken}`,
      "X-Vedoy-Source": "shopify",
      "X-Vedoy-Delivery-Id": headers.deliveryId,
    },
    body: JSON.stringify({
      version: 1,
      source: "shopify",
      deliveryId: headers.deliveryId,
      shopDomain: headers.shopDomain,
      topic: headers.topic,
      receivedAt: new Date().toISOString(),
      payload: normalizeShopifyPayload(headers.topic, payload),
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(4_000),
  }).catch(() => null);

  if (!forwardResponse?.ok) {
    return NextResponse.json(
      { error: "Growth kunne ikke ta imot webhooken. Shopify må prøve på nytt." },
      { status: 503 },
    );
  }

  return NextResponse.json({ received: true, deliveryId: headers.deliveryId });
}
