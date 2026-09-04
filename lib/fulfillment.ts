import "server-only";
import type Stripe from "stripe";
import { getServerType, normalizeHostingSelection } from "@/lib/hosting-catalog";
import { isDomainProviderConfigured, purchaseDomain } from "@/lib/vercel-domains";

function getCompany(session: Stripe.Checkout.Session) {
  const field = session.custom_fields?.find((item) => item.key === "company");
  return field?.text?.value || undefined;
}

async function buyRequestedDomain(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};
  if (metadata.domain_mode !== "new" || !metadata.domain) return;
  if (!isDomainProviderConfigured()) throw new Error("Domenet er betalt, men Vercel Registrar er ikke konfigurert for levering.");

  const details = session.customer_details;
  const address = details?.address;
  const names = details?.name?.trim().split(/\s+/) || [];
  if (!details?.email || !details.phone || !address?.country || !address.line1 || !address.city || !address.postal_code || !names.length) {
    throw new Error("Stripe-ordren mangler påkrevd kontaktinformasjon for domeneregistrering.");
  }

  await purchaseDomain(metadata.domain, {
    firstName: names[0],
    lastName: names.slice(1).join(" ") || names[0],
    email: details.email,
    phone: details.phone,
    country: address.country,
    address1: address.line1,
    city: address.city,
    postalCode: address.postal_code,
    state: address.state || undefined,
    orgName: getCompany(session)
  });
}

async function hetznerRequest(path: string, init?: RequestInit) {
  const token = process.env.HETZNER_API_TOKEN;
  if (!token) throw new Error("Hetzner er ikke konfigurert for automatisk klargjøring.");
  const response = await fetch(`https://api.hetzner.cloud/v1${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init?.headers }
  });
  const data = await response.json() as Record<string, unknown> & { error?: { message?: string } };
  if (!response.ok) throw new Error(data.error?.message || "Hetzner-klargjøringen feilet.");
  return data;
}

async function provisionServers(session: Stripe.Checkout.Session) {
  const sshKeys = process.env.HETZNER_SSH_KEY_NAMES?.split(",").map((key) => key.trim()).filter(Boolean);
  if (!process.env.HETZNER_API_TOKEN || !sshKeys?.length) return { mode: "manual" as const };

  const metadata = session.metadata || {};
  const selection = normalizeHostingSelection({
    serverCount: Number(metadata.server_count),
    ramGb: Number(metadata.ram_gb),
    storageGb: Number(metadata.storage_gb),
    region: metadata.region,
    backups: metadata.backups === "true",
    domainMode: (metadata.domain_mode || "none") as "new" | "existing" | "none",
    domain: metadata.domain || undefined
  });
  const serverType = getServerType(selection.ramGb);
  if (!serverType) throw new Error("Fant ikke servertypen som ble bestilt.");

  const checkoutLabel = session.id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 63);
  const existing = await hetznerRequest(`/servers?label_selector=${encodeURIComponent(`checkout_session=${checkoutLabel}`)}`) as { servers?: Array<{ id: number }> };
  const existingCount = existing.servers?.length || 0;

  for (let index = existingCount; index < selection.serverCount; index += 1) {
    const serverData = await hetznerRequest("/servers", {
      method: "POST",
      body: JSON.stringify({
        name: `vedoy-${checkoutLabel.slice(-20)}-${index + 1}`,
        server_type: serverType,
        image: process.env.HETZNER_IMAGE || "ubuntu-24.04",
        location: selection.region,
        ssh_keys: sshKeys,
        backups: selection.backups,
        start_after_create: true,
        labels: { managed_by: "vedoy-studio", checkout_session: checkoutLabel }
      })
    }) as { server?: { id: number } };
    if (!serverData.server?.id) throw new Error("Serveren ble opprettet uten en gyldig ID.");
    await hetznerRequest("/volumes", {
      method: "POST",
      body: JSON.stringify({ name: `data-${checkoutLabel.slice(-16)}-${index + 1}`, size: selection.storageGb, server: serverData.server.id, automount: true, format: "ext4", labels: { managed_by: "vedoy-studio", checkout_session: checkoutLabel } })
    });
  }

  return { mode: "automatic" as const };
}

export async function fulfillHostingOrder(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") return;
  await buyRequestedDomain(session);
  return provisionServers(session);
}
