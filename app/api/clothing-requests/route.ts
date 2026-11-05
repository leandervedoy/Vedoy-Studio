import { NextResponse } from "next/server";
import { createClothingRequest, createGrowthNotification } from "@/lib/repository";

const acceptedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
const maxLogoSize = 5 * 1024 * 1024;

function collectiveProductUrl(input: string): string | null {
  if (!input) return null;
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" || !["vedoycollective.com", "www.vedoycollective.com"].includes(url.hostname.toLowerCase())) return null;
    if (!/^\/(?:collections\/[a-z0-9-]+\/)?products\/[a-z0-9][a-z0-9-]*\/?$/i.test(url.pathname)) return null;
    return `https://vedoycollective.com${url.pathname}`;
  } catch { return null; }
}

function clean(value: FormDataEntryValue | null, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    if (clean(form.get("website"), 10)) return NextResponse.json({ ok: true });
    const name = clean(form.get("name"), 100);
    const email = clean(form.get("email"), 254).toLowerCase();
    const quantity = Number(clean(form.get("quantity"), 5));
    const rawProductUrl = clean(form.get("productUrl"), 450);
    const productUrl = collectiveProductUrl(rawProductUrl);
    if (rawProductUrl && !productUrl) return NextResponse.json({ error: "Bruk en gyldig produktlenke fra vedoycollective.com." }, { status: 400 });
    const productName = productUrl ? "Produkt fra Vedoy Collective-katalogen" : clean(form.get("productName"), 140);
    const productCode = productUrl ? "COLLECTIVE-CATALOG" : clean(form.get("productCode"), 40);
    const details = [productUrl ? `Katalogprodukt: ${productUrl}` : "", clean(form.get("details"), 2800)].filter(Boolean).join("\n");
    const logoFile = form.get("logo");
    const logo = logoFile instanceof File && logoFile.size > 0 ? logoFile : null;
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || !Number.isInteger(quantity) || quantity < 1 || quantity > 10000) {
      return NextResponse.json({ error: "Kontroller kontaktinformasjon og antall." }, { status: 400 });
    }
    if (logo && (!acceptedTypes.has(logo.type) || logo.size > maxLogoSize)) {
      return NextResponse.json({ error: "Logo må være PNG, JPG, WebP eller SVG og maks 5 MB." }, { status: 400 });
    }
    const id = await createClothingRequest({
      name,
      company: clean(form.get("company"), 120) || undefined,
      email,
      phone: clean(form.get("phone"), 40) || undefined,
      productName,
      productCode,
      quantity,
      details: details || undefined,
      logoFilename: logo?.name.slice(0, 180),
      logoContentType: logo?.type,
      logo: logo ? Buffer.from(await logo.arrayBuffer()) : undefined
    });
    if (process.env.ADMIN_EMAIL) {
      try { await createGrowthNotification({ userEmail: process.env.ADMIN_EMAIL, type: "lead", title: "Ny forespørsel om profilprodukter", detail: `${name} har sendt inn forespørsel om ${productName || "profilprodukter"}.`, href: "/studio/requests" }); }
      catch (error) { console.error("clothing_notification_failed", error); }
    }
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    console.error("clothing_request_failed", error);
    return NextResponse.json({ error: "Forespørselen kunne ikke lagres akkurat nå. Prøv igjen eller ring 459 17 041." }, { status: 503 });
  }
}
