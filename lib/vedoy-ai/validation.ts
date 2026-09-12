import { categories, colors } from "./types";
import { AiError, field } from "./server";
export function agentInput(data: Record<string, unknown>) {
  const category = field(data, "category", 40), color = field(data, "color", 30);
  if (!(categories as readonly string[]).includes(category) || !(colors as readonly string[]).includes(color)) throw new AiError(400, "invalid_input");
  return { name: field(data, "name", 100), description: field(data, "description", 300, false), system_prompt: field(data, "system_prompt", 12000), category, color };
}
