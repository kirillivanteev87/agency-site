export type ChatTurnRole = "client" | "manager";

export type ChatTurn = {
  role: ChatTurnRole;
  content: string;
};

export function isAiChatSubmission(message: string): boolean {
  return message.trimStart().startsWith("[AI-чат]");
}

export function parseAiChatTranscript(message: string): ChatTurn[] {
  const dialogMatch = message.match(/Диалог:\s*([\s\S]*)/i);
  const body = (dialogMatch?.[1] ?? message).trim();
  if (!body) return [];

  const parts = body.split(/(?=(?:Клиент|Менеджер):\s*)/g).map((p) => p.trim()).filter(Boolean);
  const turns: ChatTurn[] = [];

  for (const part of parts) {
    const match = part.match(/^(Клиент|Менеджер):\s*([\s\S]*)$/);
    if (!match) continue;
    turns.push({
      role: match[1] === "Клиент" ? "client" : "manager",
      content: match[2].trim(),
    });
  }

  return turns;
}
