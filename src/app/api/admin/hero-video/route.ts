import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const VIDEO_EXT = /\.(mp4|webm|mov|mkv|ogv|m4v|avi|mpeg|mpg)$/i;

function isVideoFile(file: File) {
  const t = (file.type || "").toLowerCase().trim();
  if (t.startsWith("video/")) return true;
  if (
    (t === "application/octet-stream" || t === "application/mp4" || t === "binary/octet-stream") &&
    VIDEO_EXT.test(file.name)
  ) {
    return true;
  }
  return VIDEO_EXT.test(file.name);
}

function safeFileBaseName(originalName: string) {
  const cleaned = originalName.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/^_+|_+$/g, "");
  return cleaned.length >= 2 && cleaned !== "_" ? cleaned : "video.mp4";
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const variantRaw = formData.get("variant");
    const variant = variantRaw === "light" ? "light" : "dark";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "Пустой файл" }, { status: 400 });
    }
    if (!isVideoFile(file)) {
      return NextResponse.json(
        { error: "Нужен видеофайл (MP4, WebM, MOV и др.)" },
        { status: 400 },
      );
    }
    if (file.size > MAX_VIDEO_BYTES) {
      return NextResponse.json({ error: "Видео слишком большое (макс. 100 МБ)" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "video");
    await mkdir(uploadsDir, { recursive: true });

    const safeName = `${Date.now()}-${safeFileBaseName(file.name || "video.mp4")}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      await writeFile(path.join(uploadsDir, safeName), buffer);
    } catch (writeErr) {
      const code =
        writeErr && typeof writeErr === "object" && "code" in writeErr
          ? String((writeErr as NodeJS.ErrnoException).code)
          : "";
      const hint =
        code === "EROFS" || code === "EACCES"
          ? " На serverless-хостинге запись в public недоступна — используйте внешний URL."
          : "";
      console.error("[hero-video] writeFile failed:", writeErr);
      return NextResponse.json({ error: `Не удалось сохранить файл.${hint}` }, { status: 500 });
    }

    const url = `/video/${safeName}`;
    const field = variant === "light" ? "heroVideoUrlLight" : "heroVideoUrl";

    const settings = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: { [field]: url },
      create: { id: 1, [field]: url },
    });

    try {
      revalidatePath("/");
      revalidatePath("/admin");
    } catch (revErr) {
      console.error("[hero-video] revalidatePath:", revErr);
    }

    return NextResponse.json({
      ok: true,
      variant,
      url,
      heroVideoUrl: settings.heroVideoUrl ?? "",
      heroVideoUrlLight: settings.heroVideoUrlLight ?? "",
    });
  } catch (e) {
    console.error("[hero-video POST]", e);
    const raw = e instanceof Error ? e.message : "Ошибка сервера";
    if (raw.includes("Unknown argument") && raw.includes("heroVideoUrlLight")) {
      return NextResponse.json(
        {
          error:
            "Сервер не видит поле heroVideoUrlLight. Выполните npx prisma generate && npx prisma migrate deploy и перезапустите npm run dev.",
        },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: raw }, { status: 500 });
  }
}
