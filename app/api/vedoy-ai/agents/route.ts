import { aiContext, endpoint, jsonBody, checkDb } from "@/lib/vedoy-ai/server";
import { agentInput } from "@/lib/vedoy-ai/validation";
export function GET(request: Request) { return endpoint(async () => {
  const { db } = await aiContext(request);
  const [agents, preferences] = await Promise.all([
    db.from("vedoy_ai_agents").select("*").order("created_at", { ascending: false }).limit(500),
    db.from("vedoy_ai_agent_preferences").select("agent_id,hidden,favorite").limit(1000),
  ]);
  checkDb(agents.error); checkDb(preferences.error);
  return agents.data!.map(agent => ({ ...agent, ...preferences.data!.find(p => p.agent_id === agent.id) }));
}); }
export function POST(request: Request) { return endpoint(async () => {
  const { db, user } = await aiContext(request);
  const input = agentInput(await jsonBody(request));
  const { data, error } = await db.from("vedoy_ai_agents").insert({ ...input, user_id: user.id, is_system: false }).select().single();
  checkDb(error); return data;
}); }
