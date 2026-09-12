import { createClient } from "@supabase/supabase-js";
export class AiError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function aiContext(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) throw new AiError(401, "sign_in_required");
  const url = process.env.NEXT_PUBLIC_AI_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_AI_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new AiError(503, "setup_required");
  const db = createClient(url, key, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) throw new AiError(401, "sign_in_required");
  return { db, user: data.user };
}
export async function jsonBody(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 40000) throw new AiError(413, "invalid_input");
  const text = await request.text();
  if (text.length > 40000) throw new AiError(413, "invalid_input");
  try { const data: unknown = JSON.parse(text); if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error(); return data as Record<string, unknown>; }
  catch { throw new AiError(400, "invalid_input"); }
}
export function field(data: Record<string, unknown>, key: string, max: number, required = true) {
  const value = data[key];
  if (typeof value !== "string" || value.trim().length > max || (required && !value.trim())) throw new AiError(400, "invalid_input");
  return value.trim();
}
export function uuid(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new AiError(400, "invalid_input"); return id;
}
export function checkDb(error: { message: string } | null) {
  if (error) { console.error("Vedoy AI database request failed"); throw new AiError(503, "database_error"); }
}
export async function endpoint(work: () => Promise<unknown>) {
  try { return Response.json(await work(), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return Response.json({ error: error instanceof AiError ? error.message : "request_failed" }, { status: error instanceof AiError ? error.status : 500, headers: { "Cache-Control": "no-store" } }); }
}
