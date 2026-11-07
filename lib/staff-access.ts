import "server-only";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { listTeamMembers } from "@/lib/repository";
import type { SessionPayload } from "@/lib/types";

const INTERNAL_ORGANIZATION_ID = "org_vedoy";
const STAFF_ROLES = new Set(["owner", "admin", "manager", "editor"]);

/**
 * A signed Studio login is not an employee credential. The general OAuth flow
 * auto-provisions ordinary members, and those accounts must NOT inherit the
 * fixed org_vedoy data tables. Never grant privileges based on email alone.
 */
export async function hasVerifiedStaffSession(session: SessionPayload | null): Promise<boolean> {
  if (!session) return false;
  const email = session.email.trim().toLowerCase();
  if (email === "leander@vedoy.store" && session.role === "vedoy_owner" &&
      session.organizationId === INTERNAL_ORGANIZATION_ID) return true;
  if (session.organizationId !== INTERNAL_ORGANIZATION_ID) return false;
  try {
    const members = await listTeamMembers();
    return members.some(member =>
      member.organizationId === INTERNAL_ORGANIZATION_ID &&
      member.email.trim().toLowerCase() === email &&
      STAFF_ROLES.has(member.role)
    );
  } catch {
    return false; // fail closed on DB errors
  }
}

export async function getVerifiedStaffSession(): Promise<SessionPayload | null> {
  const session = await (await import("@/lib/auth")).getSession();
  return await hasVerifiedStaffSession(session) ? session : null;
}

export async function requireVedoyStaff(): Promise<SessionPayload> {
  const session = await requireSession();
  if (!(await hasVerifiedStaffSession(session))) notFound();
  return session;
}
