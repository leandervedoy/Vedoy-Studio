import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { getSql } from "@/lib/db";

type StoredKey = { id: string; organizationId: string; secretHash: string; scopes: string[]; revokedAt?: Date; expiresAt?: Date; rateLimitPerMinute: number };
const windows = new Map<string, { started: number; count: number }>();

export async function authenticateApiKey(request: Request, scope: string) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token?.startsWith("vdy_live_")) return null;
  const sql = getSql(); if (!sql) return null;
  const prefix = token.slice(0, 17);
  const rows = await sql<Array<StoredKey & { organizationId: string; secretHash: string; scopes: string[] | string }>>`
    select id, organization_id as "organizationId", secret_hash as "secretHash", scopes, revoked_at as "revokedAt", expires_at as "expiresAt", rate_limit_per_minute as "rateLimitPerMinute"
    from api_keys where prefix = ${prefix} and revoked_at is null limit 1`;
  const key = rows[0];
  if (!key || (key.expiresAt && new Date(key.expiresAt) <= new Date())) return null;
  const expected = Buffer.from(key.secretHash, "hex"); const actual = Buffer.from(createHash("sha256").update(token).digest("hex"), "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  const scopes = typeof key.scopes === "string" ? JSON.parse(key.scopes) as string[] : key.scopes;
  if (!scopes.includes(scope)) return null;
  const now = Date.now(); const window = windows.get(key.id);
  const active = window && now - window.started < 60_000 ? window : { started: now, count: 0 };
  active.count += 1; windows.set(key.id, active);
  if (active.count > Number(key.rateLimitPerMinute)) return { limited: true as const };
  await sql`update api_keys set last_used_at = now() where id = ${key.id}`;
  return { limited: false as const, id: key.id, organizationId: key.organizationId, scopes };
}

export async function revokeApiKey(id: string, organizationId: string, actorEmail?: string) {
  const sql = getSql(); if (!sql) throw new Error("Databasen er ikke konfigurert.");
  await sql.begin(async (tx) => {
    await tx`update api_keys set revoked_at = now() where id = ${id} and organization_id = ${organizationId}`;
    await tx`insert into platform_api_key_audit (id, organization_id, api_key_id, action, actor_email) values (${`audit_${crypto.randomUUID().replaceAll("-", "")}`}, ${organizationId}, ${id}, 'revoked', ${actorEmail ?? null})`;
  });
}
