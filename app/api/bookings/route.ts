import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createBooking, listBookings } from "@/lib/repository";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const status = url.searchParams.get("status");
  const serviceId = url.searchParams.get("serviceId");
  const staffId = url.searchParams.get("staffId");

  const bookings = (await listBookings()).filter((booking) => {
    if (from && new Date(booking.endsAt) <= new Date(from)) return false;
    if (to && new Date(booking.startsAt) >= new Date(to)) return false;
    if (status && status !== "all" && booking.status !== status) return false;
    if (serviceId && serviceId !== "all" && booking.serviceId !== serviceId) return false;
    if (staffId && staffId !== "all" && booking.staffId !== staffId) return false;
    return true;
  });

  const session = await getSession();
  if (session) return NextResponse.json({ bookings });

  // Offentlig kundevisning trenger bare opptatte tidsrom, aldri kontaktinformasjon.
  return NextResponse.json({
    bookings: bookings
      .filter((booking) => booking.status !== "cancelled")
      .map((booking) => ({
        ...booking,
        customerName: "Opptatt",
        customerEmail: "private@vedoy.local",
        customerPhone: undefined,
        notes: undefined,
        customFields: undefined
      }))
  });
}

export async function POST(request: Request) {
  let body: {
    serviceId?: string;
    serviceName?: string;
    planId?: string;
    staffId?: string;
    location?: string;
    customFields?: Record<string, string | boolean>;
    startsAt?: string;
    endsAt?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    notes?: string;
  };
  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  if (!body.serviceId || !body.serviceName || !body.startsAt || !body.endsAt || !body.customerName || !body.customerEmail) {
    return NextResponse.json({ error: "Mangler nødvendig bookinginformasjon." }, { status: 400 });
  }
  if (body.serviceId.length > 120 || body.serviceName.length > 160 || body.customerName.length > 160 || body.customerEmail.length > 254 || (body.notes?.length ?? 0) > 4000) {
    return NextResponse.json({ error: "Én eller flere verdier er for lange." }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(body.customerEmail)) {
    return NextResponse.json({ error: "E-postadressen ser ikke riktig ut." }, { status: 400 });
  }
  const startsAt = new Date(body.startsAt);
  const endsAt = new Date(body.endsAt);
  if (!Number.isFinite(startsAt.getTime()) || !Number.isFinite(endsAt.getTime())) {
    return NextResponse.json({ error: "Dato eller klokkeslett er ugyldig." }, { status: 400 });
  }
  if (endsAt <= startsAt) {
    return NextResponse.json({ error: "Sluttid må være etter starttid." }, { status: 400 });
  }

  try {
    const booking = await createBooking({
      serviceId: body.serviceId,
      serviceName: body.serviceName,
      planId: body.planId,
      staffId: body.staffId,
      location: body.location,
      customFields: body.customFields,
      startsAt: body.startsAt,
      endsAt: body.endsAt,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      notes: body.notes
    });
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Bookingen kunne ikke lagres." }, { status: 409 });
  }
}
