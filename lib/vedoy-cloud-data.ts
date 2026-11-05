import { createClient } from "@supabase/supabase-js";
import type { CloudIdentity } from "@/lib/vedoy-cloud-auth";
export const CLOUD_BUCKET = "vedoy-cloud-private";
export const MAX_CLOUD_FILE = 10 * 1024 * 1024;
export const CLOUD_QUOTA = 100 * 1024 * 1024;

export function cloudDb() {
  const url = process.env.VEDOY_SUPABASE_URL;
  const key = process.env.VEDOY_SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Cloud backend is not configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function findCloudProject(db: ReturnType<typeof cloudDb>, identity: CloudIdentity, id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await db.from("vedoy_cloud_projects").select("id,name,source,github_url,github_default_branch,created_at").eq("id", id).eq("owner_id", identity.sub).maybeSingle();
  if (error) throw error;
  return data;
}
export function cleanFilePath(input: string): string | null {
  if (!input || input.length > 500 || input.includes("\\") || /[\u0000-\u001f]/.test(input)) return null;
  const parts = input.split("/");
  if (parts.length > 20 || parts.some(p => !p || p === "." || p === ".." || p.length > 120)) return null;
  return parts.join("/");
}
export function cloudError(error: unknown) {
  console.error("Vedoy Cloud operation failed", error instanceof Error ? error.message : "unknown");
  return { error: "Kunne ikke behandle forespørselen akkurat nå." };
}
