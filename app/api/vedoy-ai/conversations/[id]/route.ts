import { AiError, aiContext, endpoint, checkDb, uuid } from "@/lib/vedoy-ai/server";
export function GET(request: Request, context: { params: Promise<{ id: string }> }) { return endpoint(async () => {
  const { db } = await aiContext(request);
  const { data, error } = await db.from("vedoy_ai_conversations").select("*").eq("id", uuid((await context.params).id)).maybeSingle();
  checkDb(error); if (!data) throw new AiError(404, "not_found"); return data;
}); }
