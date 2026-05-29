import { NextResponse } from "next/server";
import { z } from "zod";
import { notifyLeadByEmailSafe } from "@/lib/lead-notification";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(1, "Укажите имя").max(200),
  email: z.string().trim().email("Некорректный email").max(200),
  phone: z
    .string()
    .trim()
    .min(1, "Укажите телефон")
    .max(30)
    .regex(/^[\d\s+()-]+$/, "Некорректный номер телефона"),
  message: z.string().trim().min(1, "Напишите сообщение").max(5000),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  await prisma.contactSubmission.create({ data: parsed.data });
  notifyLeadByEmailSafe({
    source: "contact",
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    message: parsed.data.message,
  });
  return NextResponse.json({ ok: true });
}
