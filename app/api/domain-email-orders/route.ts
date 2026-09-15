import { NextResponse } from "next/server";
import { isAdminSession, requireSession } from "@/lib/auth";
import { createDomainEmailOrder, createGrowthNotification, listDomainEmailOrders, updateDomainEmailOrderStatus } from "@/lib/repository";
import { sendAdminLeadEmail } from "@/lib/lead-email";
import type { ProvisioningRequestStatus } from "@/lib/types";

const statuses = new Set<ProvisioningRequestStatus>(["received", "reviewing", "ordered", "ready", "needs-info", "cancelled"]);
function clean(value: unknown, max: number) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function validEmail(value: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function validDomain(value: string) { return /^(?=.{3,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(value); }
function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host")?.split(",")[0].trim() || request.headers.get("host") || new URL(request.url).host;
  return new URL(origin).host.toLowerCase() === host.toLowerCase();
}

export async function GET() {
  const session = await requireSession();
  if (!isAdminSession(session)) return NextResponse.json({ error: "Bare Administrator kan se bestillinger." }, { status: 403 });
  return NextResponse.json({ orders: await listDomainEmailOrders() });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 403 });
  try {
    const body = await request.json() as Record<string, unknown>;
    if (clean(body.website, 40)) return NextResponse.json({ ok: true });
    const companyName = clean(body.companyName, 140);
    const contactName = clean(body.contactName, 100);
    const contactEmail = clean(body.contactEmail, 254).toLowerCase();
    const phone = clean(body.phone, 40);
    const domain = clean(body.domain, 253).toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    const domainMode = body.domainMode === "new" || body.domainMode === "transfer" || body.domainMode === "existing" ? body.domainMode : null;
    const mailboxCount = Number(body.mailboxCount);
    const emailPackage = body.emailPackage === "standard" || body.emailPackage === "none" ? body.emailPackage : null;
    const requestedAddresses = Array.isArray(body.requestedAddresses) ? body.requestedAddresses.map((value) => clean(value, 254).toLowerCase()).filter(validEmail).slice(0, 100) : [];
    const notes = clean(body.notes, 2000);
    if (!companyName || !contactName || !validEmail(contactEmail) || !validDomain(domain) || !domainMode || !emailPackage || !Number.isInteger(mailboxCount) || mailboxCount < 0 || mailboxCount > 100 || (emailPackage === "standard" && mailboxCount < 1) || requestedAddresses.length > mailboxCount) {
      return NextResponse.json({ error: "Kontroller kontakt, domene, antall postbokser og e-postadresser." }, { status: 400 });
    }
    const order = await createDomainEmailOrder({ companyName, contactName, contactEmail, phone: phone || undefined, domain, domainMode, mailboxCount, requestedAddresses, emailPackage, notes: notes || undefined });
    if (process.env.ADMIN_EMAIL) {
      try { await createGrowthNotification({ userEmail: process.env.ADMIN_EMAIL, type: "lead", title: "Ny domene- og e-postbestilling", detail: `${companyName} ønsker ${domain}.`, href: "/studio/companies" }); } catch (error) { console.error("domain_email_notification_failed", error); }
    }
    try {
      await sendAdminLeadEmail({ subject: `Ny domene-/e-postbestilling · ${domain}`, replyTo: contactEmail, text: [`Virksomhet: ${companyName}`, `Kontakt: ${contactName}`, `E-post: ${contactEmail}`, phone ? `Telefon: ${phone}` : "", `Domene: ${domain} (${domainMode})`, `E-postpakke: ${emailPackage === "standard" ? "Standard" : "Ingen"}`, `Postbokser: ${mailboxCount}`, `Ønskede adresser: ${requestedAddresses.join(", ") || "Ikke oppgitt"}`, notes ? `Notater: ${notes}` : ""].filter(Boolean).join("\n") });
    } catch (error) { console.error("domain_email_email_failed", error); }
    return NextResponse.json({ ok: true, order: { id: order.id, status: order.status } }, { status: 201 });
  } catch (error) {
    console.error("domain_email_order_failed", error);
    return NextResponse.json({ error: "Bestillingen kunne ikke lagres akkurat nå. Prøv igjen eller kontakt Vedøy." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const session = await requireSession();
  if (!isAdminSession(session)) return NextResponse.json({ error: "Bare Administrator kan endre status." }, { status: 403 });
  const body = await request.json() as Record<string, unknown>;
  const id = clean(body.id, 100);
  const status = body.status as ProvisioningRequestStatus;
  if (!id || !statuses.has(status)) return NextResponse.json({ error: "Ugyldig statusendring." }, { status: 400 });
  return NextResponse.json({ order: await updateDomainEmailOrderStatus(id, status) });
}
