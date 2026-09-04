import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateContactRequestStatus } from "@/lib/repository";
import type { ContactRequest } from "@/lib/types";

const allowedStatuses: ContactRequest["status"][] = ["pending", "contacted", "approved", "rejected", "closed"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  try {
    const { id } = await params;
    const body = await request.json() as { status?: ContactRequest["status"] };
    if (!body.status || !allowedStatuses.includes(body.status)) return NextResponse.json({ error: "Ugyldig status." }, { status: 400 });
    await updateContactRequestStatus(id, body.status);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Status kunne ikke oppdateres." }, { status: 400 });
  }
}
