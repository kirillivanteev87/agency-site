import { NextResponse } from "next/server";
import { z } from "zod";
import { trimMessagesForApi } from "@/lib/ai-chat-messages";
import { buildAiChatSystemPrompt, stripLeadFormMarker } from "@/lib/ai-chat-system-prompt";
import { deepseekChatCompletion, type ChatMessage } from "@/lib/deepseek";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const bodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.string(),
      content: z.string(),
    }),
  ),
});

export async function POST(request: Request) {
  if (!process.env.DEEPSEEK_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "Чат временно недоступен. Напишите нам в форме заявки внизу страницы." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const history = trimMessagesForApi(parsed.data.messages);
  if (history.length === 0) {
    return NextResponse.json({ error: "Напишите сообщение" }, { status: 400 });
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const brandName = settings?.brandName?.trim() || "REDLINE";

  const apiMessages: ChatMessage[] = [
    { role: "system", content: buildAiChatSystemPrompt(brandName) },
    ...history,
  ];

  try {
    const raw = await deepseekChatCompletion(apiMessages);
    const { reply, showLeadForm } = stripLeadFormMarker(raw);
    return NextResponse.json({ reply, showLeadForm });
  } catch (e) {
    console.error("[ai-chat]", e);
    const message = e instanceof Error ? e.message : "Ошибка чата";
    return NextResponse.json(
      { error: message.includes("DEEPSEEK") ? "Чат временно недоступен" : "Не удалось получить ответ. Попробуйте ещё раз." },
      { status: 500 },
    );
  }
}
