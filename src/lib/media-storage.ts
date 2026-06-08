import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export type MediaFolder = "uploads" | "video";

/** Vercel serverless has read-only FS; local dev writes to public/. */
function useBlobStorage(): boolean {
  return process.env.VERCEL === "1";
}

function safeFileBaseName(originalName: string, fallback: string) {
  const cleaned = originalName.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/^_+|_+$/g, "");
  return cleaned.length >= 2 && cleaned !== "_" ? cleaned : fallback;
}

export function buildMediaFileName(originalName: string, fallback: string): string {
  return `${Date.now()}-${safeFileBaseName(originalName, fallback)}`;
}

export async function putMedia(
  buffer: Buffer,
  folder: MediaFolder,
  fileName: string,
  contentType?: string,
): Promise<{ url: string }> {
  if (useBlobStorage()) {
    const blobPath = `${folder}/${fileName}`;
    const blob = await put(blobPath, buffer, {
      access: "public",
      contentType: contentType || undefined,
      addRandomSuffix: false,
    });
    return { url: blob.url };
  }

  const uploadsDir = path.join(process.cwd(), "public", folder);
  await mkdir(uploadsDir, { recursive: true });

  try {
    await writeFile(path.join(uploadsDir, fileName), buffer);
  } catch (writeErr) {
    const code =
      writeErr && typeof writeErr === "object" && "code" in writeErr
        ? String((writeErr as NodeJS.ErrnoException).code)
        : "";
    const hint =
      code === "EROFS" || code === "EACCES"
        ? " Диск недоступен для записи (на serverless-хостинге используйте Vercel Blob)."
        : "";
    throw new Error(`Не удалось сохранить файл.${hint}`, { cause: writeErr });
  }

  return { url: `/${folder}/${fileName}` };
}
