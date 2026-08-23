import { createHmac, timingSafeEqual } from "node:crypto";

const allowedTopics = new Set(["orders/create", "products/update", "customers/create"]);

export type ShopifyWebhookHeaders = {
  deliveryId: string | null;
  shopDomain: string | null;
  topic: string | null;
  hmac: string | null;
};

export function readShopifyWebhookHeaders(headers: Headers): ShopifyWebhookHeaders {
  return {
    deliveryId: headers.get("x-shopify-webhook-id"),
    shopDomain: headers.get("x-shopify-shop-domain"),
    topic: headers.get("x-shopify-topic"),
    hmac: headers.get("x-shopify-hmac-sha256"),
  };
}

export function isAllowedShopifyTopic(topic: string | null): topic is "orders/create" | "products/update" | "customers/create" {
  return topic !== null && allowedTopics.has(topic);
}

export function verifyShopifyWebhook(rawBody: Buffer, receivedHmac: string | null, secret: string) {
  if (!receivedHmac) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("base64");
  const received = Buffer.from(receivedHmac, "utf8");
  const calculated = Buffer.from(expected, "utf8");

  return received.length === calculated.length && timingSafeEqual(received, calculated);
}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as UnknownRecord) : null;
}

function stringValue(record: UnknownRecord | null, key: string) {
  const value = record?.[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : null;
}

/** Sends only operational data needed by Growth, not shipping or payment details. */
export function normalizeShopifyPayload(topic: string, payload: unknown) {
  const record = asRecord(payload);

  if (topic === "orders/create") {
    const customer = asRecord(record?.customer);
    return {
      kind: "order",
      id: stringValue(record, "id"),
      name: stringValue(record, "name"),
      email: stringValue(record, "email"),
      currency: stringValue(record, "currency"),
      total: stringValue(record, "total_price"),
      financialStatus: stringValue(record, "financial_status"),
      createdAt: stringValue(record, "created_at"),
      customer: customer
        ? {
            id: stringValue(customer, "id"),
            email: stringValue(customer, "email"),
            firstName: stringValue(customer, "first_name"),
            lastName: stringValue(customer, "last_name"),
          }
        : null,
    };
  }

  if (topic === "products/update") {
    return {
      kind: "product",
      id: stringValue(record, "id"),
      title: stringValue(record, "title"),
      handle: stringValue(record, "handle"),
      status: stringValue(record, "status"),
      updatedAt: stringValue(record, "updated_at"),
    };
  }

  return {
    kind: "customer",
    id: stringValue(record, "id"),
    email: stringValue(record, "email"),
    firstName: stringValue(record, "first_name"),
    lastName: stringValue(record, "last_name"),
    state: stringValue(record, "state"),
    updatedAt: stringValue(record, "updated_at"),
  };
}
