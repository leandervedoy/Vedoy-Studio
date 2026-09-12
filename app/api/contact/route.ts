import { NextResponse } from "next/server";
import { createContactRequest, createGrowthNotification } from "@/lib/repository";

const allowedNeeds = new Set(["Nettside", "Webapp", "Nettbutikk", "Shopify-app eller integrasjon", "Hosting og domene", "Design og profil", "Profilprodukter", "Trykk og print", "Musiker og artist", "Kunstner og merch"]);

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    if (clean(body.website, 10)) return NextResponse.json({ ok: true });
    const name = clean(body.name, 100);
    const email = clean(body.email, 254).toLowerCase();
    const need = clean(body.need, 80);
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || !allowedNeeds.has(need)) {
      return NextResponse.json({ error: "Kontroller navn, e-post og hva du trenger." }, { status: 400 });
    }
    const attribution = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "landing_page"]
      .map((key) => `${key}=${clean(body[key], 180)}`)
      .filter((value) => !value.endsWith("="))
      .join(" | ");
    const message = clean(body.message, 3000);
    const id = await createContactRequest({
      name,
      company: clean(body.company, 120) || undefined,
      email,
      phone: clean(body.phone, 40) || undefined,
      need,
      message: [message, attribution ? `Kampanjeinformasjon: ${attribution}` : ""].filter(Boolean).join("\n\n") || undefined
    });
    if (process.env.ADMIN_EMAIL) {
      try { await createGrowthNotification({ userEmail: process.env.ADMIN_EMAIL, type: "lead", title: "Ny henvendelse", detail: `${name} ønsker hjelp med ${need}.`, href: "/studio/requests" }); }
      catch (error) { console.error("contact_notification_failed", error); }
    }
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    console.error("contact_request_failed", error);
    return NextResponse.json({ error: "Skjemaet kunne ikke lagres akkurat nå. Ring 459 17 041 eller prøv igjen." }, { status: 503 });
  }
}
