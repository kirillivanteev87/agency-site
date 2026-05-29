"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { blobToFile } from "@/lib/crop-image";
import { parseJsonArray } from "@/lib/parse-json";
import { ImageCropDialog } from "./ImageCropDialog";

export type AdminFieldGroup = { label: string; fields: string[] };

type ItemEditorProps = {
  item: Record<string, unknown>;
  /** Плоский список полей (если нет fieldGroups) */
  fields?: string[];
  /** Группы для визуального редактора модалок и карточек */
  fieldGroups?: AdminFieldGroup[];
  onSave: (id: number, data: Record<string, unknown>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onUpload?: (file: File) => Promise<string>;
  /** Соотношение сторон при загрузке обложки (например 4/3 для кейсов) */
  coverCropAspect?: number;
  /** Соотношение сторон при загрузке фото в gallery */
  galleryCropAspect?: number;
  /** Убрать нижние отступы карточки (в split-layout) */
  flush?: boolean;
};

const DEFAULT_UPLOAD_CROP_ASPECT = 1;

const fieldLabels: Record<string, string> = {
  title: "Заголовок",
  description: "Краткое описание (карточка)",
  body: "О проекте (текст)",
  gallery: "Галерея (JSON массив URL)",
  imageUrl: "Обложка (URL)",
  link: "Внешняя ссылка (опционально)",
  sortOrder: "Порядок",
  tag: "Тег",
  landingHeroMeta: "Строка под заголовком (Hero)",
  landingMetrics: "Метрики (JSON массив строк, для карточки и Hero)",
  challengeTitle: "Заголовок блока «Задача»",
  challengeText: "Текст задачи",
  solutionTitle: "Заголовок блока «Решение»",
  solutionText: "Текст решения",
  benefitsTitle: "Заголовок «Преимущества продукта»",
  benefitsItems: "Преимущества (JSON: [{\"title\":\"...\",\"text\":\"...\"}])",
  howItWorksTitle: "Заголовок «Как мы это сделали»",
  howItWorksSteps: "Этапы (JSON: [{\"title\":\"...\",\"text\":\"...\"}])",
  scopeTitle: "Заголовок «Что входит в решение»",
  scopeItems: "Пункты работ (JSON массив строк)",
  resultsTitle: "Заголовок «Результат»",
  resultsText: "Текст результата",
  storyTitle: "Заголовок «О проекте»",
  testimonialQuote: "Цитата отзыва",
  testimonialAuthor: "Автор отзыва",
  testimonialRole: "Должность / компания",
  ctaTitle: "Заголовок финального CTA",
  ctaSubtitle: "Подзаголовок финального CTA",
  icon: "Иконка",
  variant: "Вариант",
  question: "Вопрос",
  answer: "Ответ",
  subtitle: "Подзаголовок",
  priceLabel: "Цена подписки (текст)",
  badge: "Бейдж на обложке",
  category: "Категория (redline или ready)",
  features: "Возможности (JSON массив строк)",
  featured: "Рекомендуем на витрине",
  published: "Опубликовано на сайте",
};

function isTextareaField(field: string) {
  return (
    field.includes("description") ||
    field.includes("Text") ||
    field === "answer" ||
    field === "body" ||
    field === "gallery" ||
    field === "features" ||
    field === "scopeItems" ||
    field === "benefitsItems" ||
    field === "howItWorksSteps" ||
    field === "landingMetrics" ||
    field === "testimonialQuote" ||
    field === "ctaSubtitle"
  );
}

function isBooleanField(field: string) {
  return field === "featured" || field === "published";
}

export function ItemEditor({
  item,
  fields,
  fieldGroups,
  onSave,
  onDelete,
  onUpload,
  coverCropAspect,
  galleryCropAspect,
  flush,
}: ItemEditorProps) {
  const [draft, setDraft] = useState(item);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [galleryCropSrc, setGalleryCropSrc] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const id = Number(item.id);

  const groups = useMemo(() => {
    if (fieldGroups?.length) return fieldGroups;
    if (fields?.length) return [{ label: "", fields }];
    return [];
  }, [fieldGroups, fields]);

  const allFields = useMemo(() => groups.flatMap((g) => g.fields), [groups]);

  useEffect(() => {
    setDraft(item);
  }, [item]);

  useEffect(() => {
    return () => {
      if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
      if (galleryCropSrc?.startsWith("blob:")) URL.revokeObjectURL(galleryCropSrc);
    };
  }, [cropSrc, galleryCropSrc]);

  function openCropWithFile(file: File) {
    if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
    setCropSrc(URL.createObjectURL(file));
  }

  function openCropWithUrl(url: string) {
    setCropSrc(url);
  }

  async function uploadCroppedBlob(blob: Blob) {
    if (!onUpload) return;
    const file = blobToFile(blob, `cover-${Date.now()}.jpg`);
    const url = await onUpload(file);
    setDraft((prev) => ({ ...prev, imageUrl: url }));
  }

  async function uploadGalleryCroppedBlob(blob: Blob) {
    if (!onUpload) return;
    const file = blobToFile(blob, `gallery-${Date.now()}.jpg`);
    const url = await onUpload(file);
    let arr: string[] = [];
    try {
      const parsed = JSON.parse(String(draft.gallery || "[]"));
      if (Array.isArray(parsed)) arr = parsed.filter((x) => typeof x === "string");
    } catch {
      arr = [];
    }
    arr.push(url);
    setDraft({ ...draft, gallery: JSON.stringify(arr) });
  }

  function renderField(field: string) {
    return (
      <label key={field} className="block">
        {fieldLabels[field] ?? field}
        {isBooleanField(field) ? (
          <input
            type="checkbox"
            className="!mt-2 !w-auto"
            checked={Boolean(draft[field])}
            onChange={(e) => setDraft({ ...draft, [field]: e.target.checked })}
          />
        ) : isTextareaField(field) ? (
          <textarea
            rows={field === "body" ? 10 : field === "gallery" ? 4 : field === "features" ? 5 : 3}
            value={String(draft[field] ?? "")}
            onChange={(e) => setDraft({ ...draft, [field]: e.target.value })}
          />
        ) : (
          <input
            value={String(draft[field] ?? "")}
            onChange={(e) =>
              setDraft({
                ...draft,
                [field]: field === "sortOrder" ? Number(e.target.value) : e.target.value,
              })
            }
          />
        )}
        {field === "gallery" && (
          <GalleryStrip
            urls={parseJsonArray<string>(String(draft.gallery ?? "[]"), []).filter(Boolean)}
            onRemove={(url) => {
              const next = parseJsonArray<string>(String(draft.gallery ?? "[]"), []).filter(
                (u) => u !== url,
              );
              setDraft({ ...draft, gallery: JSON.stringify(next) });
            }}
          />
        )}
      </label>
    );
  }

  return (
    <>
    {cropSrc ? (
      <ImageCropDialog
        open
        imageSrc={cropSrc}
        aspect={coverCropAspect ?? DEFAULT_UPLOAD_CROP_ASPECT}
        title={coverCropAspect != null ? "Обрезка обложки" : "Обрезка изображения"}
        onClose={() => {
          if (cropSrc.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
          setCropSrc(null);
        }}
        onConfirm={uploadCroppedBlob}
      />
    ) : null}
    {galleryCropSrc ? (
      <ImageCropDialog
        open
        imageSrc={galleryCropSrc}
        aspect={galleryCropAspect ?? DEFAULT_UPLOAD_CROP_ASPECT}
        title="Обрезка фото галереи"
        onClose={() => {
          if (galleryCropSrc.startsWith("blob:")) URL.revokeObjectURL(galleryCropSrc);
          setGalleryCropSrc(null);
        }}
        onConfirm={async (blob) => {
          await uploadGalleryCroppedBlob(blob);
          if (galleryCropSrc.startsWith("blob:")) URL.revokeObjectURL(galleryCropSrc);
          setGalleryCropSrc(null);
        }}
      />
    ) : null}
    <div className={`admin-card admin-item-editor space-y-4 ${flush ? "" : "mb-4"}`}>
      {groups.map((group, gi) => (
        <div key={`${group.label || "g"}-${gi}`} className="space-y-3">
          {group.label ? (
            <h3 className="border-b border-[var(--border)] pb-2 text-sm font-semibold uppercase tracking-wide text-accent">
              {group.label}
            </h3>
          ) : null}
          {group.fields.map((field) => renderField(field))}
        </div>
      ))}

      {allFields.includes("gallery") && onUpload && (
        <label className="block text-sm text-[var(--text-muted)]">
          Загрузить файл в галерею
          <input
            type="file"
            accept="image/*"
            className="mt-1"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (galleryCropSrc?.startsWith("blob:")) URL.revokeObjectURL(galleryCropSrc);
              setGalleryCropSrc(URL.createObjectURL(file));
              e.target.value = "";
            }}
          />
        </label>
      )}
      {onUpload && allFields.includes("imageUrl") && (
        <div className="space-y-2 border-t border-[var(--border)] pt-3">
          <p className="text-sm font-medium text-[var(--text)]">Обложка для карточки</p>
          {String(draft.imageUrl ?? "") ? (
            <div
              className={`admin-cover-preview w-full max-w-xs overflow-hidden rounded-[calc(var(--radius)-4px)] border border-[var(--border)] ${
                coverCropAspect ? "aspect-[4/3]" : "aspect-video"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={String(draft.imageUrl)} alt="" className="h-full w-full object-cover" />
            </div>
          ) : null}
          <label className="block text-sm text-[var(--text-muted)]">
            {coverCropAspect
              ? "Загрузить фото — откроется обрезка под карточку"
              : "Загрузить обложку"}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="mt-1"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                openCropWithFile(file);
              }}
            />
          </label>
          {String(draft.imageUrl ?? "") ? (
            <button
              type="button"
              className="btn-outline text-sm"
              onClick={() => openCropWithUrl(String(draft.imageUrl))}
            >
              Обрезать заново
            </button>
          ) : null}
        </div>
      )}
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="button"
          className="btn-primary text-sm"
          onClick={() => {
            const { id: _omit, ...payload } = draft;
            void onSave(id, payload);
          }}
        >
          Сохранить
        </button>
        <button type="button" className="btn-outline text-sm" onClick={() => void onDelete(id)}>
          Удалить
        </button>
      </div>
    </div>
    </>
  );
}

function GalleryStrip({ urls, onRemove }: { urls: string[]; onRemove: (url: string) => void }) {
  if (urls.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {urls.map((url) => (
        <div
          key={url}
          className="relative h-16 w-16 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--input-bg)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            className="absolute right-0 top-0 rounded-bl bg-black/70 px-1.5 py-0.5 text-xs text-white hover:bg-red-600"
            onClick={() => onRemove(url)}
            aria-label="Удалить из галереи"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
