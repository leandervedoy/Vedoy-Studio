import { AiError, aiContext, endpoint, checkDb, uuid } from "@/lib/vedoy-ai/server";
export function GET(request: Request) { return endpoint(async () => {
  const { db } = await aiContext(request);
  const { data, error } = await db.from("vedoy_ai_conversations").select("id,agent_id,title,updated_at").order("updated_at", { ascending: false }).limit(100);
  checkDb(error); return data;
}); }
export function DELETE(request: Request) { return endpoint(async () => {
  const { db, user } = await aiContext(request);
  const id = uuid(new URL(request.url).searchParams.get("id") || "");
  const { data, error } = await db.from("vedoy_ai_conversations").delete().eq("id", id).eq("user_id", user.id).select("id").maybeSingle();
  checkDb(error); if (!data) throw new AiError(404, "not_found"); return { ok: true };
}); }
