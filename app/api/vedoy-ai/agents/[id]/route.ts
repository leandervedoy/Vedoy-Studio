import { AiError, aiContext, endpoint, jsonBody, checkDb, uuid } from "@/lib/vedoy-ai/server";
import { agentInput } from "@/lib/vedoy-ai/validation";
type Context = { params: Promise<{ id: string }> };
export function PATCH(request: Request, context: Context) { return endpoint(async () => {
  const { db, user } = await aiContext(request);
  const id = uuid((await context.params).id), body = await jsonBody(request);
  if (body.action === "preferences") {
    if (typeof body.hidden !== "boolean" || typeof body.favorite !== "boolean") throw new AiError(400, "invalid_input");
    const agent = await db.from("vedoy_ai_agents").select("id").eq("id", id).maybeSingle();
    checkDb(agent.error); if (!agent.data) throw new AiError(404, "not_found");
    const result = await db.from("vedoy_ai_agent_preferences").upsert({ user_id: user.id, agent_id: id, hidden: body.hidden, favorite: body.favorite });
    checkDb(result.error); return { ok: true };
  }
  const result = await db.from("vedoy_ai_agents").update(agentInput(body)).eq("id", id).eq("user_id", user.id).eq("is_system", false).select().maybeSingle();
  checkDb(result.error); if (!result.data) throw new AiError(404, "not_found"); return result.data;
}); }
export function DELETE(request: Request, context: Context) { return endpoint(async () => {
  const { db, user } = await aiContext(request);
  const result = await db.from("vedoy_ai_agents").delete().eq("id", uuid((await context.params).id)).eq("user_id", user.id).eq("is_system", false).select("id").maybeSingle();
  checkDb(result.error); if (!result.data) throw new AiError(404, "not_found"); return { ok: true };
}); }
