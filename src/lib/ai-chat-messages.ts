export type ApiChatMessage = {
  role: "user" | "assistant";
  content: string;
};

/** Лимит для DeepSeek и валидации API */
export const AI_CHAT_MAX_MESSAGES = 20;
export const AI_CHAT_MAX_CONTENT_LENGTH = 2000;

export function trimMessagesForApi(messages: { role: string; content: string }[]): ApiChatMessage[] {
  const valid: ApiChatMessage[] = [];

  for (const m of messages) {
    if (m.role !== "user" && m.role !== "assistant") continue;
    const content = m.content.trim().slice(0, AI_CHAT_MAX_CONTENT_LENGTH);
    if (!content) continue;
    valid.push({ role: m.role, content });
  }

  return valid.slice(-AI_CHAT_MAX_MESSAGES);
}
