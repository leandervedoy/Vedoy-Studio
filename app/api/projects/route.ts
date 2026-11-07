import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sameOriginWrite } from "@/lib/vedoy-manager";
import { requirePreviewAdmin } from "@/lib/studio-preview-access";
import { createProject, listProjects } from "@/lib/repository";

// Legacy projects are org_vedoy-wide and do not yet implement per-customer ownership.
async function canManageLegacyProjects() {
  const session = await getSession();
  return Boolean(session && await requirePreviewAdmin(session));
}
const denied = () => NextResponse.json({ error: "Ingen tilgang." }, {
  status: 403, headers: { "Cache-Control": "no-store" }
});

export async function GET() {
  if (!await canManageLegacyProjects()) return denied();
  return NextResponse.json({ projects: await listProjects() }, {
    headers: { "Cache-Control": "no-store" }
  });
}

export async function POST(request: Request) {
  if (!await canManageLegacyProjects()) return denied();
  if (!sameOriginWrite(request)) return denied();
  const body = await request.json().catch(() => null) as { name?: unknown; framework?: unknown; productionUrl?: unknown } | null;
  if (typeof body?.name !== "string" || body.name.trim().length < 2 || body.name.length > 160)
    return NextResponse.json({ error: "Prosjektnavn må inneholde 2–160 tegn." }, { status: 400 });
  try {
    const project = await createProject({
      name: body.name,
      framework: typeof body.framework === "string" ? body.framework.slice(0, 60) : undefined,
      productionUrl: typeof body.productionUrl === "string" ? body.productionUrl.slice(0, 240) : undefined
    });
    return NextResponse.json({ project }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Kunne ikke opprette prosjekt." }, { status: 500 });
  }
}
