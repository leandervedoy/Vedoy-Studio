export type Locale = "nb" | "en";
export type Agent = {
  id: string; user_id: string | null; name: string; description: string;
  system_prompt: string; category: string; color: string; is_system: boolean;
  created_at: string; hidden?: boolean; favorite?: boolean;
};
export type Message = { role: "user" | "assistant"; content: string };
export type Conversation = { id: string; agent_id: string | null; title: string; messages: Message[]; updated_at: string };
export type Settings = { locale: Locale; workspace_name: string; compact: boolean };
export const categories = ["general", "writing", "business", "technology", "creative"] as const;
export const colors = ["sage", "lavender", "peach", "sky", "yellow"] as const;
