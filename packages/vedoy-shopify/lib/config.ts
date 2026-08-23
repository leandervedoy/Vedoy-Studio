export const SHOPIFY_API_VERSION_DEFAULT = "2026-07";

export type ShopifyStatus = {
  status: "not_configured" | "ready_for_pilot";
  missing: string[];
  apiVersion: string;
};

export type ShopifyConfig = {
  apiSecret: string;
  apiVersion: string;
  growthWebhookUrl: string;
  growthWebhookToken: string;
};

const required = [
  ["SHOPIFY_API_SECRET", process.env.SHOPIFY_API_SECRET],
  ["VEDOY_GROWTH_WEBHOOK_URL", process.env.VEDOY_GROWTH_WEBHOOK_URL],
  ["VEDOY_GROWTH_WEBHOOK_TOKEN", process.env.VEDOY_GROWTH_WEBHOOK_TOKEN],
] as const;

export function getShopifyStatus(): ShopifyStatus {
  const missing = required
    .filter(([, value]) => !value?.trim())
    .map(([name]) => name);

  return {
    status: missing.length === 0 ? "ready_for_pilot" : "not_configured",
    missing,
    apiVersion: process.env.SHOPIFY_API_VERSION?.trim() || SHOPIFY_API_VERSION_DEFAULT,
  };
}

export function getShopifyConfig(): ShopifyConfig {
  const status = getShopifyStatus();

  if (status.missing.length > 0) {
    throw new Error(`Shopify-integrasjonen mangler: ${status.missing.join(", ")}`);
  }

  return {
    apiSecret: process.env.SHOPIFY_API_SECRET!.trim(),
    apiVersion: status.apiVersion,
    growthWebhookUrl: process.env.VEDOY_GROWTH_WEBHOOK_URL!.trim(),
    growthWebhookToken: process.env.VEDOY_GROWTH_WEBHOOK_TOKEN!.trim(),
  };
}
