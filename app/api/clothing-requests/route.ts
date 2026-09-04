import { NextResponse } from "next/server";
import { createClothingRequest } from "@/lib/repository";

const acceptedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
const maxLogoSize = 5 * 1024 * 1024;

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
      productName: clean(form.get("productName"), 140),
      productCode: clean(form.get("productCode"), 40),
      quantity,
      details: clean(form.get("details"), 3000) || undefined,
      logoFilename: logo?.name.slice(0, 180),
      logoContentType: logo?.type,
      logo: logo ? Buffer.from(await logo.arrayBuffer()) : undefined
    });
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    console.error("clothing_request_failed", error);
    return NextResponse.json({ error: "Forespørselen kunne ikke lagres akkurat nå. Prøv igjen eller ring 459 17 041." }, { status: 503 });
  }
}
