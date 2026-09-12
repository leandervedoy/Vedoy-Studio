import { aiContext, checkDb, endpoint } from "@/lib/vedoy-ai/server";

export function GET(request: Request) { return endpoint(async () => {
  const { db, user } = await aiContext(request);
  const tables = ["vedoy_ai_agents", "vedoy_ai_agent_preferences", "vedoy_ai_conversations", "vedoy_ai_settings"];
  const data: Record<string, unknown[]> = {};
  for (const table of tables) {
    data[table] = [];
    for (let offset = 0; ; offset += 500) {
      const result = await db.from(table).select("*").eq("user_id", user.id).range(offset, offset + 499);
      checkDb(result.error); data[table].push(...(result.data || []));
      if (!result.data || result.data.length < 500) break;
    }
  }
  return { exported_at: new Date().toISOString(), data };
}); }
