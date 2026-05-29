import { NextResponse } from "next/server";
import { z } from "zod";
import { notifyLeadByEmailSafe } from "@/lib/lead-notification";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(1).max(200),
  phone: z
    .string()
    .trim()
    .min(1)
    .max(30)
    .regex(/^[\d\s+()-]+$/, "Некорректный номер телефона"),
  email: z
    .string()
    .trim()
    .max(200)
    .optional()
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Некорректный email"),
  transcript: z.string().trim().max(20000).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Проверьте имя и телефон" }, { status: 400 });
  }

  const { name, phone, email, transcript } = parsed.data;
  const emailStored = email && email.length > 0 ? email : "—";
  const summary = transcript?.slice(0, 4000) || "—";

  const message = `[AI-чат] Заявка на созвон\n\nДиалог:\n${summary}`;

  await prisma.contactSubmission.create({
    data: {
      name,
      phone,
      email: emailStored,
      message,
    },
  });

  notifyLeadByEmailSafe({
    source: "ai-chat",
    name,
    phone,
    email: emailStored,
    message,
  });

  return NextResponse.json({ ok: true });
}
