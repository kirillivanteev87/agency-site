import { getStore } from "@netlify/blobs";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export type MediaFolder = "uploads" | "video";

export const NETLIFY_MEDIA_STORE = "agency-media";

export type StorageBackend = "local" | "vercel-blob" | "netlify-blobs";

/** Vercel Blob when token is set (works on any host); else Netlify Blobs on Netlify; local dev uses public/. */
export function getStorageBackend(): StorageBackend {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "vercel-blob";
  if (process.env.NETLIFY === "true") return "netlify-blobs";
  return "local";
}

export function mediaBlobKey(folder: MediaFolder, fileName: string): string {
  return `${folder}/${fileName}`;
}

export function mediaPublicUrl(folder: MediaFolder, fileName: string): string {
  return `/api/media/${folder}/${fileName}`;
}

function safeFileBaseName(originalName: string, fallback: string) {
  const cleaned = originalName.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/^_+|_+$/g, "");
  return cleaned.length >= 2 && cleaned !== "_" ? cleaned : fallback;
}

export function buildMediaFileName(originalName: string, fallback: string): string {
  return `${Date.now()}-${safeFileBaseName(originalName, fallback)}`;
}

function netlifyMediaStore() {
  return getStore({ name: NETLIFY_MEDIA_STORE, consistency: "strong" });
}

export async function getNetlifyMedia(key: string) {
  const result = await netlifyMediaStore().getWithMetadata(key, { type: "stream" });
  if (!result) return null;
  const contentType =
    typeof result.metadata?.contentType === "string" ? result.metadata.contentType : undefined;
  return { stream: result.data, contentType };
}

export async function putMedia(
  buffer: Buffer,
  folder: MediaFolder,
  fileName: string,
  contentType?: string,
): Promise<{ url: string }> {
  const backend = getStorageBackend();

  if (backend === "vercel-blob") {
    const blobPath = mediaBlobKey(folder, fileName);
    const blob = await put(blobPath, buffer, {
      access: "public",
      contentType: contentType || undefined,
      addRandomSuffix: false,
    });
    return { url: blob.url };
  }

  if (backend === "netlify-blobs") {
    const key = mediaBlobKey(folder, fileName);
    const bytes = new Uint8Array(buffer.length);
    bytes.set(buffer);
    await netlifyMediaStore().set(key, new Blob([bytes]), {
      metadata: { contentType: contentType || "application/octet-stream" },
    });
    return { url: mediaPublicUrl(folder, fileName) };
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
        ? " Диск недоступен для записи (на serverless используйте Netlify Blobs или BLOB_READ_WRITE_TOKEN)."
        : "";
    throw new Error(`Не удалось сохранить файл.${hint}`, { cause: writeErr });
  }

  return { url: `/${folder}/${fileName}` };
}
