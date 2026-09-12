import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, sessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

const VERIFIER_COOKIE = "vedoy_oauth_verifier";
const STATE_COOKIE = "vedoy_oauth_state";
const NEXT_COOKIE = "vedoy_oauth_next";

type OAuthTokens = {
  access_token?: string;
  refresh_token?: string;
  error_description?: string;
};

type UserInfo = {
  picture?: string;
  preferred_username?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
};

function sameValue(left: string | undefined, right: string | null) {
  if (!left || !right) return false;
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function clearTemporaryCookies(response: NextResponse) {
  for (const name of [VERIFIER_COOKIE, STATE_COOKIE, NEXT_COOKIE]) {
    response.cookies.set(name, "", { path: "/", maxAge: 0 });
  }
}

function loginError(request: NextRequest, message: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("authError", message);
  const response = NextResponse.redirect(url);
  clearTemporaryCookies(response);
  return response;
}

export async function GET(request: NextRequest) {
  const providerError = request.nextUrl.searchParams.get("error_description") || request.nextUrl.searchParams.get("error");
  if (providerError) return loginError(request, providerError);

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const verifier = request.cookies.get(VERIFIER_COOKIE)?.value;
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;
  const next = request.cookies.get(NEXT_COOKIE)?.value?.startsWith("/studio")
    ? request.cookies.get(NEXT_COOKIE)!.value
    : "/studio";

  if (!code || !verifier || !sameValue(expectedState, state)) {
    return loginError(request, "Innloggingen er ugyldig eller har utløpt. Prøv igjen.");
  }

  const supabaseUrl = process.env.VEDOY_LOGIN_SUPABASE_URL;
  const clientId = process.env.VEDOY_LOGIN_CLIENT_ID;
  const callbackUrl = process.env.VEDOY_LOGIN_CALLBACK_URL;
  if (!supabaseUrl || !clientId || !callbackUrl) {
    return loginError(request, "Vedøy Login er ikke konfigurert.");
  }

  const tokenResponse = await fetch(new URL("/auth/v1/oauth/token", supabaseUrl), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      code_verifier: verifier,
      client_id: clientId,
      redirect_uri: callbackUrl,
    }),
    cache: "no-store",
  });
  const tokens = await tokenResponse.json() as OAuthTokens;
  if (!tokenResponse.ok || !tokens.access_token) {
    return loginError(request, tokens.error_description || "Vedøy Login kunne ikke fullføre innloggingen.");
  }

  const userResponse = await fetch(new URL("/auth/v1/oauth/userinfo", supabaseUrl), {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    cache: "no-store",
  });
  const user = await userResponse.json() as UserInfo;
  const email = user.email?.trim().toLowerCase();
  if (!userResponse.ok || !email || user.email_verified === false) {
    return loginError(request, "Vedøy-kontoen mangler en bekreftet e-postadresse.");
  }

  const allowedEmails = (process.env.STUDIO_ALLOWED_EMAILS || process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  if (allowedEmails.length === 0 || !allowedEmails.includes(email)) {
    return loginError(request, "Vedøy-kontoen er gyldig, men har ikke tilgang til Vedøy Studio ennå.");
  }

  const token = createSessionToken({
    email,
    name: user.preferred_username?.trim() || user.name?.trim() || email.split("@")[0],
    avatarUrl: user.picture?.startsWith("https://") ? user.picture : undefined,
    organizationId: "org_vedoy",
    role: email === process.env.ADMIN_EMAIL?.trim().toLowerCase() ? "owner" : "member",
  });
  const response = NextResponse.redirect(new URL(next, request.url));
  response.cookies.set(sessionCookie(token));
  clearTemporaryCookies(response);
  return response;
}
