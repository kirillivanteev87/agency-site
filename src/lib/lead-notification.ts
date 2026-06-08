import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

export type LeadSource = "contact" | "ai-chat" | "brief";

export type LeadPayload = {
  source: LeadSource;
  name: string;
  email: string;
  phone: string;
  message: string;
};

const REQUIRED_SMTP_VARS = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "LEAD_NOTIFY_EMAIL"] as const;

export function getLeadEmailConfigStatus() {
  const missing = REQUIRED_SMTP_VARS.filter((key) => !process.env[key]?.trim());
  const passEmpty = !process.env.SMTP_PASS?.trim();
  return {
    configured: missing.length === 0,
    missing: [...missing],
    passEmpty,
  };
}

function sourceLabel(source: LeadSource) {
  if (source === "ai-chat") return "AI-чат на сайте";
  if (source === "brief") return "Бриф на сайте";
  return "Форма на сайте";
}

function normalizeFromAddress() {
  const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER!.trim();
  const user = process.env.SMTP_USER!.trim();
  // Яндекс: адрес отправителя должен совпадать с SMTP_USER
  if (from.includes("<") && from.includes("@")) return from;
  if (from.includes("@")) return from;
  return `"${from.replace(/"/g, "")}" <${user}>`;
}

function createSmtpTransporter() {
  const port = Number(process.env.SMTP_PORT || "465");
  const host = process.env.SMTP_HOST!.trim();
  const isYandex = host.includes("yandex");

  const options: SMTPTransport.Options = {
    host,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER!.trim(),
      pass: process.env.SMTP_PASS!.trim(),
    },
  };

  if (port === 587) {
    options.secure = false;
    options.requireTLS = true;
  }

  if (isYandex && port === 465) {
    options.secure = true;
    options.tls = { servername: "smtp.yandex.ru" };
  }

  return nodemailer.createTransport(options);
}

export async function notifyLeadByEmail(lead: LeadPayload): Promise<void> {
  const status = getLeadEmailConfigStatus();
  if (!status.configured) {
    console.warn(
      `[lead-email] SMTP не настроен (нет в .env: ${status.missing.join(", ")}). Письмо не отправлено.`,
    );
    return;
  }

  const to = process.env.LEAD_NOTIFY_EMAIL!.trim();
  const from = normalizeFromAddress();

  const transporter = createSmtpTransporter();

  const subject = `Новая заявка: ${lead.name} (${sourceLabel(lead.source)})`;
  const text = [
    `Источник: ${sourceLabel(lead.source)}`,
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone || "—"}`,
    `Email: ${lead.email}`,
    "",
    "Сообщение:",
    lead.message,
  ].join("\n");

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
  });
}

export async function sendTestLeadEmail(): Promise<void> {
  const status = getLeadEmailConfigStatus();
  if (status.passEmpty) {
    throw new Error("SMTP_PASS пустой в .env — вставьте пароль приложения Яндекса и перезапустите npm run dev");
  }

  const transporter = createSmtpTransporter();
  await transporter.verify();

  await notifyLeadByEmail({
    source: "contact",
    name: "Тест REDLINE",
    email: "test@example.com",
    phone: "+7 (900) 000-00-00",
    message: "Проверка уведомлений о заявках. Если вы видите это письмо — SMTP настроен верно.",
  });
}

/** Не блокирует ответ API при ошибке почты */
export function notifyLeadByEmailSafe(lead: LeadPayload) {
  void notifyLeadByEmail(lead).catch((e) => {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[lead-email] Ошибка отправки:", message);
  });
}
