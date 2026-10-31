import { NextResponse } from "next/server";
import { checkInternalToken, submitNonProducingOrder, validateDraftOrder } from "../../../../lib/print-engine/providers";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const LIMIT = 12_000;
async function readLimited(request: Request): Promise<string> {
  if (Number(request.headers.get("content-length") || 0) > LIMIT) throw new Error("For stor forespørsel.");
  if (!request.body) throw new Error("Tom forespørsel.");
  const reader = request.body.getReader();
  let size = 0;
  const parts: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > LIMIT) { await reader.cancel(); throw new Error("For stor forespørsel."); }
    parts.push(value);
  }
  const full = new Uint8Array(size);
  let offset = 0;
  for (const chunk of parts) { full.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(full);
}
export async function POST(request: Request) {
  if (!checkInternalToken(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Ingen tilgang." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ error: "Krever application/json." }, { status: 415 });
  }
  try {
    const raw = JSON.parse(await readLimited(request));
    const order = validateDraftOrder(raw);
    const idempotency = request.headers.get("idempotency-key") || "";
    const result = await submitNonProducingOrder(order, idempotency);
    return NextResponse.json(result, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.startsWith("Leverandøren") || message.startsWith("Ugyldig svar")) {
      return NextResponse.json({ error: "Leverandøren kunne ikke opprette testordren. Kontroller i leverandørpanelet før du prøver igjen." }, { status: 502 });
    }
    // Never echo provider credentials, request JSON, internal URLs, or shipping details.
    const allowed = /^(Ugyldig|Ukjent|For mange|For stor|Tom forespørsel|Kun|Maks|Idempotency-Key|Filserver|Filadressen|Produktet|Leverandørnøkkel)/.test(message);
    return NextResponse.json({ error: allowed ? message : "Forespørselen kunne ikke behandles." }, { status: 400 });
  }
}
