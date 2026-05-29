import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { ensureStoredButtonLabelsJson } from "@/lib/button-labels";
import { pickSiteSettingsPayload } from "@/lib/site-settings-fields";

export const runtime = "nodejs";

function formatSettingsError(e: unknown): string {
  const raw = e instanceof Error ? e.message : "Ошибка сервера";
  if (
    raw.includes("Unknown argument") &&
    (raw.includes("heroVideoUrl") || raw.includes("heroVideoUrlLight"))
  ) {
    return "Схема БД уже с полями heroVideoUrl / heroVideoUrlLight, но сервер использует старый Prisma Client. Остановите next dev, выполните npx prisma generate и снова запустите npm run dev.";
  }
  if (raw.includes("Unknown argument")) {
    return "Устарел Prisma Client относительно схемы. Остановите dev-сервер, выполните npx prisma generate и запустите снова.";
  }
  return raw.length > 400 ? `${raw.slice(0, 400)}…` : raw;
}

export async function GET() {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    let settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.siteSettings.create({ data: { id: 1 } });
    }

    const buttonLabels = ensureStoredButtonLabelsJson(settings.buttonLabels);
    if (buttonLabels !== settings.buttonLabels) {
      settings = await prisma.siteSettings.update({
        where: { id: 1 },
        data: { buttonLabels },
      });
    }

    return NextResponse.json(settings);
  } catch (e) {
    console.error("[settings GET]", e);
    return NextResponse.json({ error: formatSettingsError(e) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const body = (await request.json()) as Record<string, unknown>;
    const data = pickSiteSettingsPayload(body);

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Нет данных для сохранения" }, { status: 400 });
    }

    if (data.buttonLabels !== undefined) {
      data.buttonLabels = ensureStoredButtonLabelsJson(data.buttonLabels);
      const probe = JSON.parse(data.buttonLabels) as Record<string, unknown>;
      if (Object.keys(probe).length === 0) {
        return NextResponse.json({ error: "Пустой список текстов кнопок" }, { status: 400 });
      }
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });

    try {
      revalidatePath("/");
      revalidatePath("/admin");
      revalidatePath("/admin/layout-editor");
      revalidatePath("/admin/content-editor");
      revalidatePath("/marketplace");
    } catch (revErr) {
      console.error("[settings PUT] revalidatePath:", revErr);
    }

    return NextResponse.json(settings);
  } catch (e) {
    console.error("[settings PUT]", e);
    return NextResponse.json({ error: formatSettingsError(e) }, { status: 500 });
  }
}
