import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createProject, listProjects } from "@/lib/repository";

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  return NextResponse.json({ projects: await listProjects() });
}

export async function POST(request: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  const body = await request.json() as { name?: string; framework?: string; productionUrl?: string };
  if (!body.name || body.name.trim().length < 2) {
    return NextResponse.json({ error: "Prosjektnavn må ha minst to tegn." }, { status: 400 });
  }
  try {
    const project = await createProject({ name: body.name, framework: body.framework, productionUrl: body.productionUrl });
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Kunne ikke opprette prosjekt." }, { status: 500 });
  }
}
