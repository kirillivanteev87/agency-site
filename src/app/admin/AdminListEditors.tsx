"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { blobToFile } from "@/lib/crop-image";
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
  urls: string[];
  onChange: (urls: string[]) => void;
  onUpload?: (file: File) => Promise<string>;
  cropAspect?: number;
};

const DEFAULT_UPLOAD_CROP_ASPECT = 1;

export function AdminGalleryEditor({
  label,
  hint,
  urls,
  onChange,
  onUpload,
  cropAspect,
}: GalleryProps) {
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
    };
  }, [cropSrc]);

  return (
    <div className="admin-list-editor">
      {cropSrc && onUpload ? (
        <ImageCropDialog
          open
          imageSrc={cropSrc}
          aspect={cropAspect ?? DEFAULT_UPLOAD_CROP_ASPECT}
          title="Обрезка фото галереи"
          onClose={() => {
            if (cropSrc.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }}
          onConfirm={async (blob) => {
            const file = blobToFile(blob, `gallery-${Date.now()}.jpg`);
            const url = await onUpload(file);
            onChange([...urls, url]);
            if (cropSrc.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }}
        />
      ) : null}
      <div className="admin-list-editor__head">
        <div>
          <p className="admin-list-editor__label">{label}</p>
          {hint ? <p className="admin-list-editor__hint">{hint}</p> : null}
        </div>
      </div>
      {urls.length > 0 ? (
        <div className="admin-gallery-grid">
          {urls.map((url, index) => (
            <div key={`${url}-${index}`} className="admin-gallery-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" />
              <button
                type="button"
                className="admin-gallery-thumb__remove"
                aria-label="Удалить фото"
                onClick={() => onChange(urls.filter((_, i) => i !== index))}
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
          Загрузить фото
          <input
            type="file"
            accept="image/*"
            className="mt-1"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setCropSrc(URL.createObjectURL(file));
            }}
          />
        </label>
      ) : null}
    </div>
  );
}
