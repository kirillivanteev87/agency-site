import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { getLeadEmailConfigStatus, sendTestLeadEmail } from "@/lib/lead-notification";

export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const status = getLeadEmailConfigStatus();
  if (status.passEmpty || status.missing.includes("SMTP_PASS")) {
    return NextResponse.json(
      {
        error:
          "В .env пустой SMTP_PASS. Создайте пароль приложения: id.yandex.ru → Безопасность → Пароли приложений → Почта. Вставьте в SMTP_PASS=\"...\" и перезапустите npm run dev.",
      },
      { status: 400 },
    );
  }
  if (!status.configured) {
    return NextResponse.json(
      {
        error: `В .env не заданы переменные: ${status.missing.join(", ")}. Скопируйте блок из .env.example и перезапустите сервер.`,
      },
      { status: 400 },
    );
  }

  try {
    await sendTestLeadEmail();
    return NextResponse.json({
      ok: true,
      message: `Тестовое письмо отправлено на ${process.env.LEAD_NOTIFY_EMAIL?.trim()}`,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Не удалось отправить";
    return NextResponse.json(
      {
        error: `${message}. Для Яндекса нужен пароль приложения (не обычный пароль): id.yandex.ru → Безопасность → Пароли приложений.`,
      },
      { status: 502 },
    );
  }
}
