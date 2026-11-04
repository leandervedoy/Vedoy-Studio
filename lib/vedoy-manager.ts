import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/auth";
import type { SessionPayload } from "@/lib/types";

export const SUPERADMIN_EMAIL = "leander@vedoy.store" as const;
export function isVedoyOwner(session: SessionPayload | null): session is SessionPayload {
  // Never infer this privilege from an editable team role or email alone.
  return Boolean(session?.email?.trim().toLowerCase() === SUPERADMIN_EMAIL && session?.role === "vedoy_owner");
}
export function isOrganizationOwner(session: SessionPayload | null): session is SessionPayload {
  return Boolean(session && (session.role === "owner" || isVedoyOwner(session)));
}
export async function managerSession() {
  const session = await getSession();
  return isVedoyOwner(session) ? session : null;
}
export function sameOriginWrite(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const target = new URL(request.url);
    const supplied = new URL(origin);
    return supplied.protocol === "https:" || process.env.NODE_ENV !== "production"
      ? target.host.toLowerCase() === supplied.host.toLowerCase() && target.protocol === supplied.protocol
      : false;
  } catch { return false; }
}
export function privilegedSupabase() {
  const url = process.env.VEDOY_SUPABASE_URL || "https://niedmgyyougvgiiuwcvw.supabase.co";
  const key = process.env.VEDOY_SUPABASE_SECRET_KEY;
  if (!key) throw new Error("VEDOY_SUPABASE_SECRET_KEY is not configured. Never use a publishable key for manager writes.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
export async function logManagerAction(actor: string, action: string, entityType: string, entityKey: string, changes: Record<string, unknown>) {
  const { error } = await privilegedSupabase().from("vedoy_manager_audit").insert({
    actor_email: actor, action, entity_type: entityType, entity_key: entityKey, changes
  });
  if (error) console.error("Manager audit write failed", error.code);
}
export const MANAGED_PERMISSIONS = [
  "workspace.read", "projects.read", "projects.edit", "customers.read", "customers.edit",
  "requests.read", "requests.edit", "team.read", "team.edit", "billing.read",
  "billing.manage", "roles.manage", "content.read"
] as const;
export function publicError(error: unknown) {
  console.error("Vedøy Manager operation failed", error instanceof Error ? error.message : "database error");
  return { error: "Tjenesten er midlertidig utilgjengelig. Prøv igjen senere." };
}
