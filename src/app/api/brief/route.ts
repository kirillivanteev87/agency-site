import { NextResponse } from "next/server";
import { z } from "zod";
import { formatBriefMessage } from "@/lib/brief-form";
import { notifyLeadByEmailSafe } from "@/lib/lead-notification";
import { prisma } from "@/lib/prisma";

const optionalText = z.string().trim().max(4000).optional().or(z.literal(""));

const schema = z.object({
  name: z.string().trim().min(1, "Укажите имя").max(200),
  email: z.string().trim().email("Некорректный email").max(200),
  phone: z
    .string()
    .trim()
    .min(1, "Укажите телефон")
    .max(30)
    .regex(/^[\d\s+()-]+$/, "Некорректный номер телефона"),
  company: optionalText,
  role: optionalText,
  productTypes: z.array(z.string()).min(1, "Выберите тип продукта").max(10),
  goals: z.string().trim().min(1, "Опишите цели проекта").max(4000),
  successMetric: optionalText,
  scope: z.string().trim().min(1, "Выберите формат проекта").max(100),
  featuresMustHave: optionalText,
  featuresOutOfScope: optionalText,
  targetAudience: optionalText,
  competitors: optionalText,
  references: optionalText,
  integrations: optionalText,
  adminNeeded: optionalText,
  contentSource: optionalText,
  designNotes: optionalText,
  brandAssets: optionalText,
  deadline: optionalText,
  budget: optionalText,
  additional: optionalText,
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return NextResponse.json({ error: first || "Проверьте поля формы" }, { status: 400 });
  }

  const data = parsed.data;
  const message = formatBriefMessage({
    ...data,
    company: data.company ?? "",
    role: data.role ?? "",
    successMetric: data.successMetric ?? "",
    featuresMustHave: data.featuresMustHave ?? "",
    featuresOutOfScope: data.featuresOutOfScope ?? "",
    targetAudience: data.targetAudience ?? "",
    competitors: data.competitors ?? "",
    references: data.references ?? "",
    integrations: data.integrations ?? "",
    adminNeeded: data.adminNeeded ?? "",
    contentSource: data.contentSource ?? "",
    designNotes: data.designNotes ?? "",
    brandAssets: data.brandAssets ?? "",
    deadline: data.deadline ?? "",
    budget: data.budget ?? "",
    additional: data.additional ?? "",
  });

  await prisma.contactSubmission.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      message,
    },
  });

  notifyLeadByEmailSafe({
    source: "brief",
    name: data.name,
    email: data.email,
    phone: data.phone,
    message,
  });

  return NextResponse.json({ ok: true });
}
