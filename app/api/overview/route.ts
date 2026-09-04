import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOverview } from "@/lib/repository";

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  return NextResponse.json(await getOverview());
}
