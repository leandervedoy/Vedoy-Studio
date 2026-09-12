"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
let client: SupabaseClient | undefined;
export function aiBrowser() {
  const url = process.env.NEXT_PUBLIC_AI_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_AI_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  client ??= createClient(url, key, { auth: { flowType: "pkce", storageKey: "vedoy-ai-auth", detectSessionInUrl: true } });
  return client;
}
export async function aiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const client = aiBrowser();
  const session = client ? (await client.auth.getSession()).data.session : null;
  const response = await fetch(`/api/vedoy-ai${path}`, {
    ...init, headers: { "Content-Type": "application/json", ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}), ...init.headers },
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "request_failed");
  return body as T;
}
