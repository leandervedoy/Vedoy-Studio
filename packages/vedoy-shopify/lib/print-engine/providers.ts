import { createHash, timingSafeEqual } from "node:crypto";
import { productById, type ProductId } from "./core";

export type Provider = "prodigi" | "gelato";
export type Address = {
  name: string; email: string; line1: string; line2?: string; city: string;
  postalCode: string; country: string; state?: string;
};
export type DraftOrder = {
  provider: Provider; productId: ProductId; reference: string; quantity: number;
  fileUrl: string; recipient: Address;
};
const SKU_NAMES: Record<ProductId, string> = {
  "poster-a4": "A4", "poster-30x40": "30X40", "poster-square": "SQUARE"
};
function value(input: unknown, max: number, name: string): string {
  if (typeof input !== "string" || input.trim().length === 0 || input.length > max) throw new Error("Ugyldig " + name + ".");
  return input.trim();
}
function object(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Ugyldig forespørsel.");
  return input as Record<string, unknown>;
}
export function validateAssetUrl(raw: unknown, allowedHost: string | undefined): string {
  const text = value(raw, 1500, "filadresse");
  if (!allowedHost || !/^[a-zA-Z0-9.-]+$/.test(allowedHost)) throw new Error("Filserver er ikke konfigurert.");
  let url: URL;
  try { url = new URL(text); } catch { throw new Error("Ugyldig filadresse."); }
  if (url.protocol !== "https:" || url.hostname !== allowedHost.toLowerCase() ||
    url.port || url.username || url.password || url.hash || !/\.(png|jpe?g|pdf)$/i.test(url.pathname)) {
    throw new Error("Filadressen må ligge på godkjent HTTPS-filserver.");
  }
  return url.href;
}
export function validateDraftOrder(input: unknown, assetHost = process.env.VEDOY_PRINT_ASSET_HOST): DraftOrder {
  const raw = object(input), rec = object(raw.recipient);
  if (raw.provider !== "prodigi" && raw.provider !== "gelato") throw new Error("Ukjent leverandør.");
  const product = productById(String(raw.productId ?? ""));
  if (!product) throw new Error("Ukjent produkt.");
  const reference = value(raw.reference, 64, "ordrereferanse");
  if (!/^[a-zA-Z0-9_-]{4,64}$/.test(reference)) throw new Error("Ugyldig ordrereferanse.");
  if (!Number.isInteger(raw.quantity) || (raw.quantity as number) < 1 || (raw.quantity as number) > 100) throw new Error("Ugyldig antall.");
  const name = value(rec.name, 100, "navn");
  const email = value(rec.email, 254, "e-post");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Ugyldig e-post.");
  const country = value(rec.country, 2, "land").toUpperCase();
  if (!/^[A-Z]{2}$/.test(country)) throw new Error("Ugyldig landkode.");
  return {
    provider: raw.provider, productId: product.id, reference, quantity: raw.quantity as number,
    fileUrl: validateAssetUrl(raw.fileUrl, assetHost),
    recipient: { name, email, line1: value(rec.line1, 140, "adresse"),
      line2: rec.line2 ? value(rec.line2, 140, "adresselinje 2") : undefined,
      city: value(rec.city, 90, "by"), postalCode: value(rec.postalCode, 20, "postnummer"),
      country, state: rec.state ? value(rec.state, 90, "fylke") : undefined
    }
  };
}
export function checkInternalToken(header: string | null, expected = process.env.VEDOY_PRINT_INTERNAL_KEY): boolean {
  if (!expected || expected.length < 32 || !header?.startsWith("Bearer ")) return false;
  const supplied = header.slice(7);
  if (supplied.length > 512) return false;
  const actual = createHash("sha256").update(supplied).digest();
  const wanted = createHash("sha256").update(expected).digest();
  return timingSafeEqual(actual, wanted);
}
export function providerSku(provider: Provider, productId: ProductId): string | undefined {
  const suffix = SKU_NAMES[productId];
  const key = provider === "prodigi" ? "VEDOY_PRINT_PRODIGI_" + suffix + "_SKU" : "VEDOY_PRINT_GELATO_" + suffix + "_UID";
  const sku = process.env[key]?.trim();
  return sku && sku.length <= 150 && /^[a-zA-Z0-9_.-]+$/.test(sku) ? sku : undefined;
}
export function providerStatus() {
  return {
    prodigiSandbox: Boolean(process.env.VEDOY_PRINT_PRODIGI_SANDBOX_KEY && process.env.VEDOY_PRINT_ASSET_HOST),
    gelatoDrafts: Boolean(process.env.VEDOY_PRINT_GELATO_KEY && process.env.VEDOY_PRINT_ASSET_HOST),
    liveProductionOrders: false,
    supportedProducts: {
      prodigi: Object.fromEntries(Object.keys(SKU_NAMES).map(id => [id, Boolean(providerSku("prodigi", id as ProductId))])),
      gelato: Object.fromEntries(Object.keys(SKU_NAMES).map(id => [id, Boolean(providerSku("gelato", id as ProductId))]))
    }
  };
}
function prepare(order: DraftOrder, idempotencyKey: string) {
  const sku = providerSku(order.provider, order.productId);
  if (!sku) throw new Error("Produktet er ikke koblet til leverandørens katalog.");
  const r = order.recipient;
  if (order.provider === "prodigi") {
    return { url: "https://api.sandbox.prodigi.com/v4.0/Orders", key: process.env.VEDOY_PRINT_PRODIGI_SANDBOX_KEY,
      environment: "sandbox" as const, body: {
        merchantReference: order.reference, idempotencyKey, shippingMethod: "Standard",
        recipient: { name: r.name, email: r.email, address: {
          line1: r.line1, line2: r.line2, townOrCity: r.city,
          postalOrZipCode: r.postalCode, countryCode: r.country, stateOrCounty: r.state
        }},
        items: [{ merchantReference: order.reference + "-1", sku, copies: order.quantity,
          sizing: "fitPrintArea", attributes: {}, assets: [{ printArea: "default", url: order.fileUrl }] }]
      }
    };
  }
  const names = r.name.trim().split(/\s+/);
  return { url: "https://order.gelatoapis.com/v4/orders", key: process.env.VEDOY_PRINT_GELATO_KEY,
    environment: "draft" as const, body: {
      orderType: "draft", orderReferenceId: order.reference, customerReferenceId: order.reference,
      currency: "NOK", items: [{ itemReferenceId: order.reference + "-1", productUid: sku,
        files: [{ type: "default", url: order.fileUrl }], quantity: order.quantity }],
      shippingAddress: { firstName: names[0], lastName: names.slice(1).join(" ") || "-",
        email: r.email, addressLine1: r.line1, addressLine2: r.line2,
        city: r.city, postCode: r.postalCode, country: r.country, state: r.state }
    }
  };
}
export async function submitNonProducingOrder(order: DraftOrder, idempotencyKey: string): Promise<{ provider: Provider; providerOrderId: string; environment: "draft" | "sandbox"; status: string }> {
  if (!/^[a-zA-Z0-9_-]{16,100}$/.test(idempotencyKey)) throw new Error("Idempotency-Key må være 16–100 tegn.");
  const req = prepare(order, idempotencyKey);
  if (!req.key || req.key.length < 10) throw new Error("Leverandørnøkkel mangler.");
  const response = await fetch(req.url, {
    method: "POST", cache: "no-store", signal: AbortSignal.timeout(8000),
    headers: { "Content-Type": "application/json", "X-API-Key": req.key },
    body: JSON.stringify(req.body)
  });
  if (!response.ok) throw new Error("Leverandøren avviste forespørselen (HTTP " + response.status + ").");
  const result: unknown = await response.json();
  const body = object(result);
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) throw new Error("Ugyldig svar fra leverandøren.");
  return { provider: order.provider, providerOrderId: id,
    environment: req.environment, status: req.environment === "draft" ? "draft" : "sandbox_created" };
}
