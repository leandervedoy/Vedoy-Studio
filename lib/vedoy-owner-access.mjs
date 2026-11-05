/** Pure auth decisions. Never grants privileged access from email alone. */
export const managerPath = "/studio/vedoy-manager";
export const managerLoginPath = `/login?next=${encodeURIComponent(managerPath)}`;

/** Only the Vedoy Supabase project can issue Studio OAuth tokens. */
export function supabaseOAuthUrlFromEnv(env) {
  const value = env?.VEDOY_LOGIN_SUPABASE_URL?.trim();
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" || parsed.hostname !== "niedmgyyougvgiiuwcvw.supabase.co" || parsed.pathname !== "/" || parsed.search || parsed.hash || parsed.username || parsed.password) return null;
    return parsed.origin;
  } catch { return null; }
}
export function safeStudioNext(value) {
  if (typeof value !== "string") return "/studio";
  return (/^\/studio(?:\/[a-zA-Z0-9_-]+)*$/.test(value) || value === "/prosjekter" || value === "/projects") ? value : "/studio";
}
export function managerDecision(session) {
  if (!session) return "login";
  const email = typeof session.email === "string" ? session.email.trim().toLowerCase() : "";
  if (email !== "leander@vedoy.store") return "notFound";
  if (session.role === "vedoy_owner") return "allow";
  return "reauth";
}
