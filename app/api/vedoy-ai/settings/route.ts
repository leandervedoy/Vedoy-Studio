import { AiError, aiContext, endpoint, jsonBody, field, checkDb } from "@/lib/vedoy-ai/server";
export function GET(request: Request) { return endpoint(async () => {
  const { db, user } = await aiContext(request);
  const { data, error } = await db.from("vedoy_ai_settings").select("locale,workspace_name,compact").eq("user_id", user.id).maybeSingle();
  checkDb(error); return data || { locale: "nb", workspace_name: "Mitt arbeidsrom", compact: false };
}); }
export function PUT(request: Request) { return endpoint(async () => {
  const { db, user } = await aiContext(request); const body = await jsonBody(request);
  if (!["nb", "en"].includes(String(body.locale)) || typeof body.compact !== "boolean") throw new AiError(400, "invalid_input");
  const { error } = await db.from("vedoy_ai_settings").upsert({ user_id: user.id, locale: body.locale, workspace_name: field(body, "workspace_name", 80), compact: body.compact });
  checkDb(error); return { ok: true };
}); }
