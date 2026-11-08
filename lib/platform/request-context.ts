import { headers } from "next/headers";
import { getSession } from "@/lib/auth";

export type PlatformRole = "owner" | "admin" | "manager" | "editor" | "member" | "employee" | "api";
export type PlatformContext = { requestId: string; organizationId: string; role: PlatformRole; actorEmail?: string };

export async function getPlatformContext(): Promise<PlatformContext> {
  const requestHeaders = await headers();
  const requestId = requestHeaders.get("x-request-id") || crypto.randomUUID();
  const session = await getSession();
  return { requestId, organizationId: session?.organizationId || "org_vedoy", role: session?.role === "vedoy_owner" ? "owner" : session?.role || "member", actorEmail: session?.email };
}

export function canManageOrganization(context: PlatformContext) { return ["owner", "admin"].includes(context.role); }
