export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host")?.split(",")[0].trim() || request.headers.get("host") || new URL(request.url).host;
  try {
    return new URL(origin).host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

export function customerInput(body: Record<string, unknown> | null) {
  const tags = Array.isArray(body?.tags) ? body.tags.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim().slice(0, 40)).filter(Boolean).slice(0, 12) : [];
  return {
    name: typeof body?.name === "string" ? body.name.trim().slice(0, 160) : "",
    email: typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "",
    phone: typeof body?.phone === "string" ? body.phone.trim().slice(0, 40) : undefined,
    company: typeof body?.company === "string" ? body.company.trim().slice(0, 160) : undefined,
    valueNok: Math.max(0, Math.min(100_000_000, Math.round(Number(body?.valueNok) || 0))),
    tags
  };
}
