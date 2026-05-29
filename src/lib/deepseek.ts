export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

type DeepSeekResponse = {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
};

export async function deepseekChatCompletion(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY не настроен на сервере");
  }

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat",
      messages,
      temperature: 0.35,
      max_tokens: 220,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as DeepSeekResponse;

  if (!res.ok) {
    const msg = data.error?.message || `DeepSeek API: ${res.status}`;
    throw new Error(msg);
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Пустой ответ от DeepSeek");
  }

  return content;
}
