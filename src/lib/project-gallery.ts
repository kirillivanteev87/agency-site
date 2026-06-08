import { parseJsonArray } from "./parse-json";

/** Одно фото галереи: обрезка для сетки, полный кадр для лайтбокса */
export type ProjectGalleryItem = {
  displayUrl: string;
  fullUrl: string;
};

export type DetailPhoto = ProjectGalleryItem;

function normalizeItem(displayUrl: string, fullUrl?: string): ProjectGalleryItem | null {
  const display = displayUrl.trim();
  if (!display) return null;
  const full = (fullUrl ?? display).trim() || display;
  return { displayUrl: display, fullUrl: full };
}

/** JSON-массив в поле gallery: строки URL или объекты { displayUrl, fullUrl } */
export function parseProjectGalleryItems(raw: string | null | undefined): ProjectGalleryItem[] {
  const parsed = parseJsonArray<unknown>(raw ?? "", []);
  const out: ProjectGalleryItem[] = [];
  for (const item of parsed) {
    if (typeof item === "string") {
      const row = normalizeItem(item);
      if (row) out.push(row);
      continue;
    }
    if (item && typeof item === "object") {
      const row = item as Record<string, unknown>;
      const normalized = normalizeItem(
        String(row.displayUrl ?? row.url ?? ""),
        String(row.fullUrl ?? row.originalUrl ?? row.displayUrl ?? row.url ?? ""),
      );
      if (normalized) out.push(normalized);
    }
  }
  return out;
}

/** @deprecated Используйте parseProjectGalleryItems */
export function parseProjectGallery(raw: string | null | undefined): string[] {
  return parseProjectGalleryItems(raw).map((i) => i.displayUrl);
}

export function serializeProjectGallery(items: ProjectGalleryItem[]): string {
  const clean = items
    .map((i) => normalizeItem(i.displayUrl, i.fullUrl))
    .filter((i): i is ProjectGalleryItem => i != null);
  return JSON.stringify(
    clean.map((i) =>
      i.fullUrl !== i.displayUrl ? { displayUrl: i.displayUrl, fullUrl: i.fullUrl } : i.displayUrl,
    ),
  );
}

/** Обложка + галерея без дубликатов по displayUrl */
export function buildDetailPhotos(imageUrl: string, galleryRaw: string | null | undefined): DetailPhoto[] {
  const gallery = parseProjectGalleryItems(galleryRaw);
  const main = imageUrl?.trim() ?? "";
  const out: DetailPhoto[] = [];
  if (main) {
    const cover = normalizeItem(main);
    if (cover) out.push(cover);
  }
  for (const item of gallery) {
    if (item.displayUrl && item.displayUrl !== main && !out.some((p) => p.displayUrl === item.displayUrl)) {
      out.push(item);
    }
  }
  return out;
}
