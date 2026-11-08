import "server-only";

type LogLevel = "info" | "warn" | "error";
export function logEvent(level: LogLevel, event: string, fields: Record<string, unknown> = {}) {
  const payload = { timestamp: new Date().toISOString(), level, event, ...fields };
  if (level === "error") console.error(JSON.stringify(payload));
  else if (level === "warn") console.warn(JSON.stringify(payload));
  else console.info(JSON.stringify(payload));
}

export function errorResponse(error: string, requestId: string, status = 400, code?: string) {
  logEvent(status >= 500 ? "error" : "warn", "api.request_failed", { requestId, status, code, error });
  return Response.json({ error, code, requestId }, { status, headers: { "x-request-id": requestId, "cache-control": "no-store" } });
}
