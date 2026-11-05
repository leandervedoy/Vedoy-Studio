/** Pure auth decisions. Never grants privileged access from email alone. */
export const managerPath = "/studio/vedoy-manager";
export const managerLoginPath = `/login?next=${encodeURIComponent(managerPath)}`;

export function neonAuthUrlFromEnv(env) {
  const value = env?.VEDOY_LOGIN_NEON_AUTH_URL?.trim() || env?.VITE_NEON_AUTH_URL?.trim();
  return value || null;
}
export function safeStudioNext(value) {
  if (typeof value !== "string") return "/studio";
  return /^\/studio(?:\/[a-zA-Z0-9_-]+)*$/.test(value) ? value : "/studio";
}
export function managerDecision(session) {
  if (!session) return "login";
  const email = typeof session.email === "string" ? session.email.trim().toLowerCase() : "";
  if (email !== "leander@vedoy.store") return "notFound";
  if (session.role === "vedoy_owner") return "allow";
  return "reauth";
}
