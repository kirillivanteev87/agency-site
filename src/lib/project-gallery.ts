import { parseJsonArray } from "./parse-json";

/** JSON-массив URL изображений в поле gallery (проект или кейс) */
export function parseProjectGallery(raw: string | null | undefined): string[] {
  return parseJsonArray<string>(raw ?? "", []).filter((u) => typeof u === "string" && u.length > 0);
}

/** Обложка + галерея без дубликатов */
export function buildDetailPhotos(imageUrl: string, galleryRaw: string | null | undefined): string[] {
  const gallery = parseProjectGallery(galleryRaw);
  const main = imageUrl?.trim() ?? "";
  const out: string[] = [];
  if (main) out.push(main);
  for (const u of gallery) {
    if (u && u !== main && !out.includes(u)) out.push(u);
  }
  return out;
}
