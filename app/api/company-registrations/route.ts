import { NextResponse } from "next/server";
import { isAdminSession, requireSession } from "@/lib/auth";
import { createCompanyRegistration, createGrowthNotification, listCompanyRegistrations, updateCompanyRegistrationStatus } from "@/lib/repository";
import { sendAdminLeadEmail } from "@/lib/lead-email";
import type { CompanyInviteDraft, CompanyRegistrationStatus, GrowthSubscriptionPlan, TeamRole } from "@/lib/types";

const plans: Record<GrowthSubscriptionPlan, { seatLimit: number; label: string }> = {
  trial: { seatLimit: 1, label: "Prøv Growth · 7 dager" },
  start: { seatLimit: 1, label: "Growth Start" },
  team: { seatLimit: 10, label: "Growth Team" },
  plus: { seatLimit: 25, label: "Growth Plus" }
};
const editableRoles = new Set<Exclude<TeamRole, "owner">>(["admin", "manager", "editor", "member"]);
const statuses = new Set<CompanyRegistrationStatus>(["received", "reviewing", "activated", "declined"]);

function clean(value: unknown, max: number) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function validEmail(value: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host")?.split(",")[0].trim() || request.headers.get("host") || new URL(request.url).host;
  return new URL(origin).host.toLowerCase() === host.toLowerCase();
}

function parseInvites(value: unknown): CompanyInviteDraft[] | null {
  if (!Array.isArray(value)) return [];
  if (value.length > 24) return null;
  const seen = new Set<string>();
  const invites: CompanyInviteDraft[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") return null;
    const item = entry as Record<string, unknown>;
    const name = clean(item.name, 80);
    const email = clean(item.email, 254).toLowerCase();
    const role = item.role as TeamRole;
    if (!name || !validEmail(email) || !editableRoles.has(role as Exclude<TeamRole, "owner">) || seen.has(email)) return null;
    seen.add(email);
    invites.push({ name, email, role: role as Exclude<TeamRole, "owner"> });
  }
  return invites;
}

export async function GET() {
  const session = await requireSession();
  if (!isAdminSession(session)) return NextResponse.json({ error: "Bare Administrator kan se bedriftsregistreringer." }, { status: 403 });
  return NextResponse.json({ registrations: await listCompanyRegistrations(), plans });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 403 });
  try {
    const body = await request.json() as Record<string, unknown>;
    if (clean(body.website, 40)) return NextResponse.json({ ok: true });
    const companyName = clean(body.companyName, 140);
    const organizationNumber = clean(body.organizationNumber, 16).replace(/\s/g, "");
    const ownerName = clean(body.ownerName, 100);
    const ownerEmail = clean(body.ownerEmail, 254).toLowerCase();
    const ownerTitle = body.ownerTitle === "owner" || body.ownerTitle === "managing-director" ? body.ownerTitle : null;
    const phone = clean(body.phone, 40);
    const subscriptionPlan = body.subscriptionPlan as GrowthSubscriptionPlan;
    const plan = plans[subscriptionPlan];
    const invitedMembers = parseInvites(body.invitedMembers);
    if (!companyName || !ownerName || !validEmail(ownerEmail) || !ownerTitle || !plan || !invitedMembers) {
      return NextResponse.json({ error: "Kontroller virksomhet, kontaktperson, e-post, abonnement og team." }, { status: 400 });
    }
    if (invitedMembers.some((member) => member.email === ownerEmail)) return NextResponse.json({ error: "Eier/daglig leder er allerede med i setetaket og skal ikke legges inn på nytt." }, { status: 400 });
    if (invitedMembers.length + 1 > plan.seatLimit) return NextResponse.json({ error: `${plan.label} har plass til ${plan.seatLimit} bruker${plan.seatLimit === 1 ? "" : "e"} inkludert eier.` }, { status: 400 });

    const registration = await createCompanyRegistration({ companyName, organizationNumber: organizationNumber || undefined, ownerName, ownerEmail, ownerTitle, phone: phone || undefined, subscriptionPlan, seatLimit: plan.seatLimit, invitedMembers });
    if (process.env.ADMIN_EMAIL) {
      try {
        await createGrowthNotification({ userEmail: process.env.ADMIN_EMAIL, type: "lead", title: "Ny bedriftsregistrering", detail: `${companyName} ønsker ${plan.label}.`, href: "/studio/companies" });
      } catch (error) { console.error("company_registration_notification_failed", error); }
    }
    try {
      await sendAdminLeadEmail({ subject: `Ny bedriftsregistrering · ${companyName}`, replyTo: ownerEmail, text: [`Virksomhet: ${companyName}`, `Kontakt: ${ownerName} (${ownerTitle === "owner" ? "Eier" : "Daglig leder"})`, `E-post: ${ownerEmail}`, phone ? `Telefon: ${phone}` : "", `Abonnement: ${plan.label}`, `Setetak: ${plan.seatLimit}`, `Planlagte ansatte: ${invitedMembers.map((member) => `${member.name} <${member.email}> (${member.role})`).join(", ") || "Ingen"}`].filter(Boolean).join("\n") });
    } catch (error) { console.error("company_registration_email_failed", error); }
    return NextResponse.json({ ok: true, registration: { id: registration.id, seatLimit: registration.seatLimit, status: registration.status } }, { status: 201 });
  } catch (error) {
    console.error("company_registration_failed", error);
    return NextResponse.json({ error: "Bedriftsregistreringen kunne ikke lagres akkurat nå. Prøv igjen eller kontakt Vedøy." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const session = await requireSession();
  if (!isAdminSession(session)) return NextResponse.json({ error: "Bare Administrator kan endre status." }, { status: 403 });
  const body = await request.json() as Record<string, unknown>;
  const id = clean(body.id, 100);
  const status = body.status as CompanyRegistrationStatus;
  if (!id || !statuses.has(status)) return NextResponse.json({ error: "Ugyldig statusendring." }, { status: 400 });
  return NextResponse.json({ registration: await updateCompanyRegistrationStatus(id, status) });
}
