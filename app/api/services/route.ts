import { NextResponse } from "next/server";
import { getSession, isAdminSession } from "@/lib/auth";
import { sameOrigin } from "@/lib/customer-input";
import { serviceInput, validateServiceInput } from "@/lib/service-input";
import { createStudioService, getNextStudioServiceNumber, listStudioServices } from "@/lib/services";

export async function GET() {
  if (!isAdminSession(await getSession())) return NextResponse.json({ error: "Krever administratortilgang." }, { status: 403 });
  return NextResponse.json({ services: await listStudioServices({ includeUnpublished: true }) });
}

export async function POST(request: Request) {
  if (!isAdminSession(await getSession())) return NextResponse.json({ error: "Krever administratortilgang." }, { status: 403 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 403 });
  const input = serviceInput(await request.json().catch(() => null) as Record<string, unknown> | null);
  const validationError = validateServiceInput(input);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
  try {
    const number = await getNextStudioServiceNumber();
    return NextResponse.json({ service: await createStudioService({ ...input, number }) }, { status: 201 });
  } catch (cause) {
    const duplicate = typeof cause === "object" && cause && "code" in cause && cause.code === "23505";
    return NextResponse.json({ error: duplicate ? "URL-identifikatoren er allerede i bruk." : "Kunne ikke opprette tjenesten." }, { status: duplicate ? 409 : 500 });
  }
}
