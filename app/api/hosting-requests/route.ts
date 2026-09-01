import { NextResponse } from "next/server";
import { createGrowthNotification, createHostingRequest } from "@/lib/repository";
import { calculateHostingPrice, normalizeHostingSelection, type HostingSelection } from "@/lib/hosting-catalog";
import { sendAdminLeadEmail } from "@/lib/lead-email";

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host")?.split(",")[0].trim() || request.headers.get("host") || new URL(request.url).host;
  return new URL(origin).host.toLowerCase() === host.toLowerCase();
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 403 });
  try {
    const body = await request.json() as Record<string, unknown>;
    if (clean(body.website, 20)) return NextResponse.json({ ok: true });
    const name = clean(body.name, 100);
    const company = clean(body.company, 120);
    const email = clean(body.email, 254).toLowerCase();
    const phone = clean(body.phone, 40);
    const details = clean(body.details, 3000);
    if (body.accepted !== true || name.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Kontroller navn, e-post og at vilkårene er godkjent." }, { status: 400 });
    }

    const selection = normalizeHostingSelection(body as Partial<HostingSelection>);
    const price = calculateHostingPrice(selection);
    const id = await createHostingRequest({
      name, company: company || undefined, email, phone: phone || undefined, ...selection,
      monthlyNok: price.monthlyNok, setupNok: price.setupNok, details: details || undefined
    });

    if (process.env.ADMIN_EMAIL) {
      try {
        await createGrowthNotification({ userEmail: process.env.ADMIN_EMAIL, type: "lead", title: "Ny hostingforespørsel", detail: `${name} har sendt en forespørsel om hosting${company ? ` for ${company}` : ""}.`, href: "/studio/requests" });
      } catch (error) { console.error("hosting_request_notification_failed", error); }
    }
    try {
      await sendAdminLeadEmail({
        subject: `Ny hostingforespørsel · ${company || name}`,
        replyTo: email,
        text: [`Kontakt: ${name}`, company ? `Bedrift: ${company}` : "", `E-post: ${email}`, phone ? `Telefon: ${phone}` : "", `Servere: ${selection.serverCount}`, `Kapasitet: ${selection.ramGb} GB RAM / ${selection.storageGb} GB lagring`, `Region: ${selection.region}`, `Domene: ${selection.domainMode}${selection.domain ? ` · ${selection.domain}` : ""}`, `Prisanslag: ${price.monthlyNok} kr/mnd + ${price.setupNok} kr etablering`, details ? `Behov: ${details}` : ""].filter(Boolean).join("\n")
      });
    } catch (error) { console.error("hosting_request_email_failed", error); }

    return NextResponse.json({ ok: true, id, status: "new", pricing: price }, { status: 201 });
  } catch (error) {
    console.error("hosting_request_failed", error);
    const message = error instanceof Error && /Ugyldig|Velg|Skriv inn/.test(error.message) ? error.message : "Bestillingsforespørselen kunne ikke lagres akkurat nå. Ring 459 17 041 eller prøv igjen.";
    return NextResponse.json({ error: message }, { status: message.startsWith("Bestillings") ? 503 : 400 });
  }
}
