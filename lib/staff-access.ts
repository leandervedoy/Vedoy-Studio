import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { listTeamMembers } from "@/lib/repository";
import type { SessionPayload } from "@/lib/types";

const INTERNAL_ORGANIZATION_ID = "org_vedoy";
const STAFF_ROLES = new Set(["owner", "admin", "manager", "editor"]);

/**
 * Studio customer login is NOT proof of employment. Keep access server-only,
 * require the internal organization, and fail closed when team data is absent.
 * 'member' is intentionally excluded because public login auto-creates members.
 */
export async function requireVedoyStaff(): Promise<SessionPayload> {
  const session = await requireSession();
  const email = session.email.trim().toLowerCase();
  if (session.role === "vedoy_owner" && email === "leander@vedoy.store") return session;
  if (session.organizationId !== INTERNAL_ORGANIZATION_ID) notFound();
  const members = await listTeamMembers().catch(() => []);
  const member = members.find((entry) =>
    entry.organizationId === INTERNAL_ORGANIZATION_ID &&
    entry.email.trim().toLowerCase() === email
  );
  if (!member || !STAFF_ROLES.has(member.role)) notFound();
  return session;
}
