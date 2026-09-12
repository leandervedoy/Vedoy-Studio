import { AiError, aiContext, endpoint, jsonBody, checkDb, uuid, field } from "@/lib/vedoy-ai/server";
import type { Message } from "@/lib/vedoy-ai/types";
import { billingReady, paidAccess } from "@/lib/vedoy-ai/billing";
export const maxDuration = 60;
export function POST(request: Request) { return endpoint(async () => {
  const { db, user } = await aiContext(request);
  if (!process.env.OPENAI_API_KEY) throw new AiError(503, "ai_not_configured");
  if (process.env.AI_STRIPE_PRICE_ID && !billingReady()) throw new AiError(503, "billing_unavailable");
  if (billingReady() && !(await paidAccess(user.id)).active) throw new AiError(402, "subscription_required");
  const body = await jsonBody(request), message = field(body, "message", 6000);
  const agentId = uuid(field(body, "agent_id", 36));
  const agent = await db.from("vedoy_ai_agents").select("id,system_prompt").eq("id", agentId).maybeSingle();
  checkDb(agent.error); if (!agent.data) throw new AiError(404, "not_found");
  let messages: Message[] = []; let id: string | undefined; let previousUpdatedAt: string | undefined;
  if (body.conversation_id) {
    id = uuid(String(body.conversation_id));
    const conversation = await db.from("vedoy_ai_conversations").select("messages,agent_id,updated_at").eq("id", id).eq("user_id", user.id).maybeSingle();
    checkDb(conversation.error);
    if (!conversation.data || conversation.data.agent_id !== agentId) throw new AiError(404, "not_found");
    messages = conversation.data.messages as Message[];
    previousUpdatedAt = conversation.data.updated_at;
    if (!Array.isArray(messages) || messages.some(item => !item || !["user", "assistant"].includes(item.role) || typeof item.content !== "string" || item.content.length > 20000)) throw new AiError(400, "invalid_conversation");
    if (messages.length >= 100) throw new AiError(400, "conversation_full");
    if (Buffer.byteLength(JSON.stringify(messages), "utf8") > 30000) throw new AiError(400, "conversation_full");
  }
  const quota = await db.rpc("vedoy_ai_reserve_message");
  checkDb(quota.error); if (!quota.data) throw new AiError(429, "daily_limit");
  const input = [...messages.slice(-20), { role: "user" as const, content: message }];
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-5-mini", store: false, max_output_tokens: 2000,
      instructions: `${agent.data.system_prompt}\nRespond in ${body.locale === "en" ? "English" : "Norwegian Bokmål"}.`, input }),
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new AiError(502, "ai_failed");
  const result = await response.json();
  const answer = (result.output || []).flatMap((item: { content?: { type: string; text?: string }[] }) => item.content || []).filter((part: { type: string }) => part.type === "output_text").map((part: { text: string }) => part.text).join("\n");
  if (!answer) throw new AiError(502, "ai_failed");
  if (answer.length > 20000) throw new AiError(502, "ai_failed");
  const updated = [...messages, { role: "user", content: message }, { role: "assistant", content: answer }];
  const write = id
    ? db.from("vedoy_ai_conversations").update({ messages: updated, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id).eq("updated_at", previousUpdatedAt!)
    : db.from("vedoy_ai_conversations").insert({ user_id: user.id, agent_id: agentId, title: message.slice(0, 80), messages: updated });
  if (Buffer.byteLength(JSON.stringify(updated), "utf8") > 58000) throw new AiError(400, "conversation_full");
  const saved = await write.select("*").maybeSingle(); checkDb(saved.error);
  if (!saved.data) throw new AiError(409, "conversation_changed"); return saved.data;
}); }
