import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "vedoy_cloud_session";
const TTL = 7 * 24 * 60 * 60;

export type CloudIdentity = { sub: string; email: string; name: string; exp: number };

function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET is missing");
  return secret;
}
function sign(payload: string) {
  return createHmac("sha256", key()).update("vedoy-cloud:v1:" + payload).digest("base64url");
}
export function cloudCookie(identity: Omit<CloudIdentity, "exp">) {
  const payload = Buffer.from(JSON.stringify({ ...identity, exp: Math.floor(Date.now() / 1000) + TTL })).toString("base64url");
  return { name: COOKIE, value: payload + "." + sign(payload), httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: TTL };
}
export async function cloudIdentity(): Promise<CloudIdentity | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw || raw.length > 4096) return null;
  const [payload, signature, extra] = raw.split(".");
  if (!payload || !signature || extra) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const obj = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as CloudIdentity;
    if (!obj || typeof obj.sub !== "string" || !/^[a-zA-Z0-9_-]{8,180}$/.test(obj.sub) || typeof obj.email !== "string" || !obj.email.includes("@") || typeof obj.exp !== "number" || obj.exp <= Date.now() / 1000) return null;
    return obj;
  } catch { return null; }
}
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}
