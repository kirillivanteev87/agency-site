"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { blobToFile, formatCropAspectLabel } from "@/lib/crop-image";
import type { ProjectGalleryItem } from "@/lib/project-gallery";
import { ImageCropDialog } from "./ImageCropDialog";

type StringListProps = {
  label: string;
  hint?: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
};

export function AdminStringListEditor({ label, hint, items, onChange, placeholder }: StringListProps) {
  return (
    <div className="admin-list-editor">
      <div className="admin-list-editor__head">
        <div>
          <p className="admin-list-editor__label">{label}</p>
          {hint ? <p className="admin-list-editor__hint">{hint}</p> : null}
        </div>
        <button
          type="button"
          className="btn-outline text-xs"
          onClick={() => onChange([...items, ""])}
        >
          <Plus size={14} />
          Добавить
        </button>
      </div>
      <ul className="admin-list-editor__items">
        {items.length === 0 ? (
          <li className="admin-list-editor__empty">Пока пусто — нажмите «Добавить»</li>
        ) : (
          items.map((value, index) => (
            <li key={index} className="admin-list-editor__row">
              <input
                value={value}
                placeholder={placeholder ?? "Текст"}
                onChange={(e) => {
                  const next = [...items];
                  next[index] = e.target.value;
                  onChange(next);
                }}
              />
              <button
                type="button"
                className="admin-list-editor__icon-btn"
                aria-label="Удалить"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

type CardItem = { title: string; text: string };

type CardListProps = {
  label: string;
  hint?: string;
  items: CardItem[];
  onChange: (items: CardItem[]) => void;
};

export function AdminCardListEditor({ label, hint, items, onChange }: CardListProps) {
  return (
    <div className="admin-list-editor">
      <div className="admin-list-editor__head">
        <div>
          <p className="admin-list-editor__label">{label}</p>
          {hint ? <p className="admin-list-editor__hint">{hint}</p> : null}
        </div>
        <button
          type="button"
          className="btn-outline text-xs"
          onClick={() => onChange([...items, { title: "", text: "" }])}
        >
          <Plus size={14} />
          Карточка
        </button>
      </div>
      <ul className="admin-list-editor__items admin-list-editor__items--cards">
        {items.length === 0 ? (
          <li className="admin-list-editor__empty">Нет карточек</li>
        ) : (
          items.map((card, index) => (
            <li key={index} className="admin-list-editor__card">
              <div className="admin-list-editor__card-head">
                <span className="text-xs text-[var(--text-muted)]">#{index + 1}</span>
                <button
                  type="button"
                  className="admin-list-editor__icon-btn"
                  aria-label="Удалить карточку"
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <label className="block">
                Заголовок
                <input
                  value={card.title}
                  onChange={(e) => {
                    const next = [...items];
                    next[index] = { ...next[index], title: e.target.value };
                    onChange(next);
                  }}
                />
              </label>
              <label className="block">
                Описание
                <textarea
                  rows={3}
                  value={card.text}
                  onChange={(e) => {
                    const next = [...items];
                    next[index] = { ...next[index], text: e.target.value };
                    onChange(next);
                  }}
                />
              </label>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

type GalleryProps = {
  label: string;
  hint?: string;
  items: ProjectGalleryItem[];
  onChange: (items: ProjectGalleryItem[]) => void;
  onUpload?: (file: File) => Promise<string>;
  cropAspect?: number;
};

const DEFAULT_UPLOAD_CROP_ASPECT = 1;

export function AdminGalleryEditor({
  label,
  hint,
  items,
  onChange,
  onUpload,
  cropAspect,
}: GalleryProps) {
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropReplaceIndex, setCropReplaceIndex] = useState<number | null>(null);
  const [cropSourceFile, setCropSourceFile] = useState<File | null>(null);
  const aspect = cropAspect ?? DEFAULT_UPLOAD_CROP_ASPECT;
  const aspectLabel = formatCropAspectLabel(aspect);

  useEffect(() => {
    return () => {
      if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
    };
  }, [cropSrc]);

  function closeCrop() {
    if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setCropReplaceIndex(null);
    setCropSourceFile(null);
  }

  function openCropWithFile(file: File) {
    if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
    setCropReplaceIndex(null);
    setCropSourceFile(file);
    setCropSrc(URL.createObjectURL(file));
  }

  function openRecrop(item: ProjectGalleryItem, index: number) {
    if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
    setCropReplaceIndex(index);
    setCropSourceFile(null);
    setCropSrc(item.fullUrl || item.displayUrl);
  }

  async function uploadGalleryPair(blob: Blob): Promise<ProjectGalleryItem> {
    if (!onUpload) throw new Error("onUpload required");
    const croppedFile = blobToFile(blob, `gallery-${Date.now()}.jpg`);
    const displayUrl = await onUpload(croppedFile);
    let fullUrl = displayUrl;
    if (cropSourceFile) {
      fullUrl = await onUpload(cropSourceFile);
    } else if (cropReplaceIndex != null) {
      const prev = items[cropReplaceIndex];
      if (prev?.fullUrl && prev.fullUrl !== prev.displayUrl) {
        fullUrl = prev.fullUrl;
      }
    }
    return { displayUrl, fullUrl };
  }

  return (
    <div className="admin-list-editor">
      {cropSrc && onUpload ? (
        <ImageCropDialog
          open
          imageSrc={cropSrc}
          aspect={aspect}
          title={cropReplaceIndex != null ? "Повторная обрезка фото" : "Обрезка фото галереи"}
          onClose={closeCrop}
          onConfirm={async (blob) => {
            const entry = await uploadGalleryPair(blob);
            if (cropReplaceIndex != null) {
              const next = [...items];
              next[cropReplaceIndex] = entry;
              onChange(next);
            } else {
              onChange([...items, entry]);
            }
            closeCrop();
          }}
        />
      ) : null}
      <div className="admin-list-editor__head">
        <div>
          <p className="admin-list-editor__label">{label}</p>
          {hint ? <p className="admin-list-editor__hint">{hint}</p> : null}
        </div>
      </div>
      {items.length > 0 ? (
        <div className="admin-gallery-grid">
          {items.map((item, index) => (
            <div key={`${item.displayUrl}-${index}`} className="admin-gallery-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.displayUrl} alt="" />
              {onUpload && cropAspect != null ? (
                <button
                  type="button"
                  className="admin-gallery-thumb__recrop"
                  aria-label="Обрезать заново"
                  onClick={() => openRecrop(item, index)}
                >
                  ✂
                </button>
              ) : null}
              <button
                type="button"
                className="admin-gallery-thumb__remove"
                aria-label="Удалить фото"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="admin-list-editor__empty">Дополнительных фото пока нет</p>
      )}
      {onUpload ? (
        <label className="mt-3 block text-sm text-[var(--text-muted)]">
          {cropAspect != null ? `Загрузить фото (кроп ${aspectLabel})` : "Загрузить фото"}
          <input
            type="file"
            accept="image/*"
            className="mt-1"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              if (cropAspect != null) openCropWithFile(file);
              else {
                void (async () => {
                  const url = await onUpload(file);
                  onChange([...items, { displayUrl: url, fullUrl: url }]);
                })();
              }
            }}
          />
        </label>
      ) : null}
    </div>
  );
}
