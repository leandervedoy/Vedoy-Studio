import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createApiKey, listApiKeys } from "@/lib/repository";
import { apiKeyCreateSchema } from "@/lib/platform/contracts";
import { getPlatformContext } from "@/lib/platform/request-context";
import { errorResponse } from "@/lib/platform/observability";
import { revokeApiKey } from "@/lib/platform/api-keys";

export async function GET() {
  const context = await getPlatformContext();
  if (!(await getSession())) return errorResponse("Ikke innlogget.", context.requestId, 401);
  return NextResponse.json({ keys: await listApiKeys() });
}

export async function POST(request: Request) {
  const context = await getPlatformContext();
  if (!(await getSession())) return errorResponse("Ikke innlogget.", context.requestId, 401);
  const parsed = apiKeyCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse("Ugyldig API-nøkkel.", context.requestId, 400, "INVALID_API_KEY");
  const created = await createApiKey(parsed.data.name, parsed.data.scopes);
  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(request: Request) {
  const context = await getPlatformContext();
  if (!(await getSession())) return errorResponse("Ikke innlogget.", context.requestId, 401);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return errorResponse("Mangler nøkkel-ID.", context.requestId, 400);
  await revokeApiKey(id, context.organizationId, context.actorEmail);
  return NextResponse.json({ revoked: true, requestId: context.requestId });
}
