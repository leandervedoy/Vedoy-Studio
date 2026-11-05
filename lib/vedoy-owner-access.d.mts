export const managerPath: "/studio/vedoy-manager";
export const managerLoginPath: "/login?next=%2Fstudio%2Fvedoy-manager";
export function supabaseOAuthUrlFromEnv(env: { VEDOY_LOGIN_SUPABASE_URL?: string }): string | null;
export function safeStudioNext(value: unknown): string;
export function managerDecision(session: { email?: string; role?: string } | null): "login" | "reauth" | "allow" | "notFound";
