import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const COOKIE = "vedoy_cloud_session";
const MAX_AGE = 60 * 60 * 24 * 3;
export const CLOUD_BUCKET = "vedoy-cloud-private";
export const CLOUD_FILE_LIMIT = 10 * 1024 * 1024;
export const CLOUD_OWNER_LIMIT = 100 * 1024 * 1024;

type CloudSession = { sub: string; email: string; name: string; exp: number };

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET is required for Vedoy Cloud");
  return s;
}
function signature(data: string) {
  return createHmac("sha256", secret()).update("vedoy-cloud-v1.").update(data).digest("base64url");
}
export function newCloudCookie(user: { sub: string; email: string; name: string }) {
  const payload: CloudSession = { ...user, exp: Math.floor(Date.now() / 1000) + MAX_AGE };
  const data = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return { name: COOKIE, value: data + "." + signature(data), httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE };
}
export function parseCloudCookie(raw: string | undefined): CloudSession | null {
  if (!raw) return null;
  const [data, sig, extra] = raw.split(".");
  if (!data || !sig || extra) return null;
  const expected = signature(data);
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const value: CloudSession = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (typeof value.sub !== "string" || !value.sub || typeof value.email !== "string" || !value.email || typeof value.name !== "string" || !Number.isFinite(value.exp) || value.exp < Date.now()/1000) return null;
    return value;
  } catch { return null; }
}
export async function cloudSession() {
  return parseCloudCookie((await cookies()).get(COOKIE)?.value);
}
export function cloudAdmin() {
  const url = process.env.VEDOY_SUPABASE_URL || "https://niedmgyyougvgiiuwcvw.supabase.co";
  const key = process.env.VEDOY_SUPABASE_SECRET_KEY;
  if (!key) throw new Error("VEDOY_SUPABASE_SECRET_KEY missing. Cloud needs server-only access.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
export function cloudSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).origin === new URL(request.url).origin; }
  catch { return false; }
}
export function cleanCloudPath(value: unknown) {
  if (typeof value !== "string") return null;
  const path = value.replaceAll("\\", "/").trim();
  if (!path || path.length > 500 || path.startsWith("/") || path.split("/").some(x => !x || x === "." || x === ".." || x.startsWith(".")) || /[\u0000-\u001f]/.test(path)) return null;
  return path;
}
export const CLOUD_SETTINGS = { maxFileBytes: CLOUD_FILE_LIMIT, maxOwnerBytes: CLOUD_OWNER_LIMIT, maxFilesPerProject: 200 } as const;
