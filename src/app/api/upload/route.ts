import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { buildMediaFileName, putMedia } from "@/lib/media-storage";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

/** Расширения видео (MIME на Windows часто пустой) */
const VIDEO_EXT = /\.(mp4|webm|mov|mkv|ogv|m4v|avi|mpeg|mpg)$/i;

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function isVideoFile(file: File) {
  const t = (file.type || "").toLowerCase().trim();
  if (t.startsWith("video/")) return true;
  /* Safari / Windows иногда отдают общий тип */
  if (
    (t === "application/octet-stream" || t === "application/mp4" || t === "binary/octet-stream") &&
    VIDEO_EXT.test(file.name)
  ) {
    return true;
  }
  return VIDEO_EXT.test(file.name);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const categoryRaw = formData.get("category");
    const category = categoryRaw === "video" ? "video" : "image";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "Пустой файл" }, { status: 400 });
    }

    if (category === "video") {
      if (!isVideoFile(file)) {
        return NextResponse.json(
          {
            error:
              "Нужен видеофайл (MP4, WebM, MOV и др.). Если расширение нестандартное — переименуйте в .mp4 или вставьте URL вручную.",
          },
          { status: 400 },
        );
      }
      if (file.size > MAX_VIDEO_BYTES) {
        return NextResponse.json({ error: "Видео слишком большое (макс. 100 МБ)" }, { status: 400 });
      }
    } else {
      if (!isImageFile(file)) {
        return NextResponse.json({ error: "Нужен файл изображения" }, { status: 400 });
      }
      if (file.size > MAX_IMAGE_BYTES) {
        return NextResponse.json({ error: "Файл слишком большой (макс. 15 МБ)" }, { status: 400 });
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const folder = category === "video" ? "video" : "uploads";
    const fallback = category === "video" ? "video.mp4" : "image";
    const fileName = buildMediaFileName(file.name || "file", fallback);

    const { url } = await putMedia(buffer, folder, fileName, file.type || undefined);

    return NextResponse.json({ url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка при приёме файла";
    console.error("[upload] failed:", e);
    return NextResponse.json(
      { error: message.includes("сохранить") ? message : "Ошибка при приёме файла (слишком большой запрос или обрыв сети)." },
      { status: 500 },
    );
  }
}
