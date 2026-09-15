import { NextResponse } from "next/server";
import { isAdminSession, requireSession } from "@/lib/auth";
import { addTeamMember, listTeamMembers, updateTeamMember } from "@/lib/repository";
import type { TeamRole } from "@/lib/types";

const editableRoles = new Set<Exclude<TeamRole, "owner">>(["admin", "manager", "editor", "member"]);
function clean(value: unknown, max: number) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
export async function GET() { await requireSession(); return NextResponse.json({ members: await listTeamMembers() }); }
export async function POST(request: Request) {
  const session = await requireSession();
  if (!isAdminSession(session)) return NextResponse.json({ error: "Bare Administrator kan legge til teamroller." }, { status: 403 });
  const body = await request.json(); const email = clean(body.email, 254).toLowerCase(); const name = clean(body.name, 80); const role = body.role as TeamRole; const teamName = clean(body.teamName, 60);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name || !teamName || !editableRoles.has(role as Exclude<TeamRole, "owner">)) return NextResponse.json({ error: "Sjekk navn, e-post, team og rolle." }, { status: 400 });
  return NextResponse.json({ member: await addTeamMember({ email, name, teamName, role: role as Exclude<TeamRole, "owner"> }) }, { status: 201 });
}
export async function PATCH(request: Request) {
  const session = await requireSession();
  if (!isAdminSession(session)) return NextResponse.json({ error: "Bare Administrator kan endre roller." }, { status: 403 });
  const body = await request.json(); const id = clean(body.id, 100); const role = body.role as TeamRole; const sortOrder = Number(body.sortOrder); const teamName = body.teamName === undefined ? undefined : clean(body.teamName, 60);
  if (!id || (body.role !== undefined && !editableRoles.has(role as Exclude<TeamRole, "owner">)) || (body.teamName !== undefined && !teamName) || (body.sortOrder !== undefined && (!Number.isFinite(sortOrder) || sortOrder < 1 || sortOrder > 9999))) return NextResponse.json({ error: "Ugyldig team- eller rolleendring." }, { status: 400 });
  return NextResponse.json({ member: await updateTeamMember(id, { role: editableRoles.has(role as Exclude<TeamRole, "owner">) ? role as Exclude<TeamRole, "owner"> : undefined, teamName, sortOrder: Number.isFinite(sortOrder) ? sortOrder : undefined }) });
}
