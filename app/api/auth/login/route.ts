import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const VERIFIER_COOKIE = "vedoy_oauth_verifier";
const STATE_COOKIE = "vedoy_oauth_state";
const NEXT_COOKIE = "vedoy_oauth_next";

function base64Url(value: Buffer) {
  return value.toString("base64url");
}

function safeNext(value: string | null) {
  return value?.startsWith("/studio") ? value : "/studio";
}

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.VEDOY_LOGIN_SUPABASE_URL;
  const clientId = process.env.VEDOY_LOGIN_CLIENT_ID;
  const callbackUrl = process.env.VEDOY_LOGIN_CALLBACK_URL;

  if (!supabaseUrl || !clientId || !callbackUrl) {
    return NextResponse.redirect(new URL("/login?authError=Vedøy%20Login%20er%20ikke%20konfigurert.", request.url));
  }

  const verifier = base64Url(randomBytes(32));
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const state = base64Url(randomBytes(24));
  const authorizeUrl = new URL("/auth/v1/oauth/authorize", supabaseUrl);
  authorizeUrl.search = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: callbackUrl,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    scope: "openid email profile",
  }).toString();

  const response = NextResponse.redirect(authorizeUrl);
  const cookie = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 10 * 60,
  };
  response.cookies.set(VERIFIER_COOKIE, verifier, cookie);
  response.cookies.set(STATE_COOKIE, state, cookie);
  response.cookies.set(NEXT_COOKIE, safeNext(request.nextUrl.searchParams.get("next")), cookie);
  return response;
}
