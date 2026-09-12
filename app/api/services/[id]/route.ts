import { NextResponse } from "next/server";
import { getSession, isAdminSession } from "@/lib/auth";
import { sameOrigin } from "@/lib/customer-input";
import { serviceInput, validateServiceInput } from "@/lib/service-input";
import { deleteStudioService, updateStudioService } from "@/lib/services";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  if (!isAdminSession(await getSession())) return NextResponse.json({ error: "Krever administratortilgang." }, { status: 403 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 403 });
  const input = serviceInput(await request.json().catch(() => null) as Record<string, unknown> | null);
  const validationError = validateServiceInput(input);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
  try {
    return NextResponse.json({ service: await updateStudioService((await context.params).id, input) });
  } catch (cause) {
    const duplicate = typeof cause === "object" && cause && "code" in cause && cause.code === "23505";
    const missing = cause instanceof Error && cause.message === "Tjenesten finnes ikke.";
    return NextResponse.json({ error: duplicate ? "URL-identifikatoren er allerede i bruk." : missing ? cause.message : "Kunne ikke oppdatere tjenesten." }, { status: duplicate ? 409 : missing ? 404 : 500 });
  }
}

export async function DELETE(request: Request, context: Context) {
  if (!isAdminSession(await getSession())) return NextResponse.json({ error: "Krever administratortilgang." }, { status: 403 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 403 });
  try {
    await deleteStudioService((await context.params).id);
    return NextResponse.json({ ok: true });
  } catch (cause) {
    const missing = cause instanceof Error && cause.message === "Tjenesten finnes ikke.";
    return NextResponse.json({ error: missing ? cause.message : "Kunne ikke slette tjenesten." }, { status: missing ? 404 : 500 });
  }
}
