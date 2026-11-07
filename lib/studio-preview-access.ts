import "server-only";
import { getSql } from "@/lib/db";
import { getBuilderPageById, listBuilderPages, type BuilderPage } from "@/lib/page-builder";
import { listTeamMembers } from "@/lib/repository";
import { isInternalPreviewAdmin, normalizePreviewEmail } from "@/lib/studio-preview-policy.mjs";
import type { SessionPayload } from "@/lib/types";

export type PreviewGrant = { email: string; grantedAt: string; expiresAt: string };

async function internalAdmin(session: SessionPayload) {
  const members = await listTeamMembers().catch(() => []);
  return isInternalPreviewAdmin(session, members);
}

/** Explicit grants are never inferred from a customer Studio login. */
export async function getAuthorizedDraft(session: SessionPayload, pageId: string): Promise<BuilderPage | null> {
  if (!/^page_[\w-]{1,90}$/.test(pageId)) return null;
  const page = await getBuilderPageById(pageId);
  if (!page || page.visibility !== "draft") return null;
  if (await internalAdmin(session)) return page;
  const email = normalizePreviewEmail(session.email);
  if (!email) return null;
  const sql = getSql();
  if (!sql) return null;
  // Fail closed when the migration has not been applied.
  const rows = await sql<{ allowed: boolean }[]> `
    select true as allowed from studio_page_preview_access
    where page_id = ${page.id} and viewer_email = ${email}
      and expires_at > now() limit 1
  `.catch(() => []);
  return rows[0]?.allowed ? page : null;
}

export async function listAuthorizedDrafts(session: SessionPayload): Promise<BuilderPage[]> {
  if (await internalAdmin(session)) return (await listBuilderPages()).filter(page => page.visibility === "draft");
  const email = normalizePreviewEmail(session.email);
  if (!email) return [];
  const sql = getSql();
  if (!sql) return [];
  const rows = await sql<{ page_id: string }[]> `
    select a.page_id from studio_page_preview_access a
    join studio_pages p on p.id = a.page_id
    where a.viewer_email = ${email} and a.expires_at > now()
      and p.organization_id = 'org_vedoy' and p.visibility = 'draft'
    order by p.updated_at desc limit 100
  `.catch(() => []);
  const pages = await Promise.all(rows.map(row => getBuilderPageById(row.page_id)));
  return pages.filter((page): page is BuilderPage => Boolean(page && page.visibility === "draft"));
}

export async function requirePreviewAdmin(session: SessionPayload): Promise<boolean> {
  return internalAdmin(session);
}

export async function listPreviewGrants(pageId: string): Promise<PreviewGrant[]> {
  const sql = getSql();
  if (!sql) throw new Error("Databasen er ikke konfigurert.");
  const rows = await sql<{ viewer_email: string; created_at: Date; expires_at: Date }[]> `
    select a.viewer_email, a.created_at, a.expires_at
    from studio_page_preview_access a join studio_pages p on p.id = a.page_id
    where a.page_id = ${pageId} and p.organization_id = 'org_vedoy'
    order by a.created_at desc
  `;
  return rows.map(row => ({
    email: row.viewer_email, grantedAt: row.created_at.toISOString(),
    expiresAt: row.expires_at.toISOString()
  }));
}

export async function grantDraftPreview(input: { pageId: string; viewerEmail: string; grantedBy: string; days: number }) {
  const page = await getBuilderPageById(input.pageId);
  if (!page || page.visibility !== "draft") throw new Error("Kan bare dele upubliserte sider.");
  const sql = getSql();
  if (!sql) throw new Error("Databasen er ikke konfigurert.");
  const email = normalizePreviewEmail(input.viewerEmail);
  if (!email) throw new Error("Ugyldig e-postadresse.");
  await sql`
    insert into studio_page_preview_access (page_id, viewer_email, granted_by, expires_at)
    values (${page.id}, ${email}, ${input.grantedBy}, now() + (${input.days} * interval '1 day'))
    on conflict (page_id, viewer_email) do update
      set granted_by = excluded.granted_by, expires_at = excluded.expires_at,
        created_at = now()
  `;
}

export async function revokeDraftPreview(pageId: string, viewerEmail: string) {
  const sql = getSql();
  if (!sql) throw new Error("Databasen er ikke konfigurert.");
  const email = normalizePreviewEmail(viewerEmail);
  if (!email) throw new Error("Ugyldig e-postadresse.");
  await sql`
    delete from studio_page_preview_access
    where page_id = ${pageId} and viewer_email = ${email}
  `;
}
