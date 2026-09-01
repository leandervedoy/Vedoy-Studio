import { NextResponse } from "next/server";

/**
 * Kept as an explicit guard for old clients and bookmarked URLs.
 * Hosting and domains are requests only; this endpoint must never create a Stripe session.
 */
export async function POST() {
  return NextResponse.json({ error: "Automatisk hosting- og domenekjøp er deaktivert. Send en bestillingsforespørsel for manuell avklaring." }, { status: 410 });
}
