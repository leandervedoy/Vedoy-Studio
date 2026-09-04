import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteBooking, updateBooking } from "@/lib/repository";
import type { StudioBooking } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  const { id } = await context.params;
  let body: Partial<Pick<StudioBooking, "status" | "startsAt" | "endsAt" | "notes">>;
  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  const allowedStatuses: StudioBooking["status"][] = ["pending", "confirmed", "in-progress", "completed", "cancelled", "no-show"];
  if (body.status && !allowedStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Ugyldig bookingstatus." }, { status: 400 });
  }
  if ((body.notes?.length ?? 0) > 4000) {
    return NextResponse.json({ error: "Notatet er for langt." }, { status: 400 });
  }
  if (body.startsAt && !Number.isFinite(new Date(body.startsAt).getTime())) {
    return NextResponse.json({ error: "Starttid er ugyldig." }, { status: 400 });
  }
  if (body.endsAt && !Number.isFinite(new Date(body.endsAt).getTime())) {
    return NextResponse.json({ error: "Sluttid er ugyldig." }, { status: 400 });
  }

  try {
    const booking = await updateBooking(id, body);
    return NextResponse.json({ booking });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kunne ikke oppdatere.";
    const status = message.includes("allerede bestilt") || message.includes("Sluttid") ? 409 : 404;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  const { id } = await context.params;
  await deleteBooking(id);
  return NextResponse.json({ ok: true });
}
