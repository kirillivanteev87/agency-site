"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import type { SiteSettingsField } from "@/lib/site-settings-fields";
import { DEFAULT_LOGO_IMAGE_URL } from "@/lib/logo-settings";

type SettingsRecord = Partial<Record<SiteSettingsField, string>>;

type Props = {
  settings: SettingsRecord;
  onChange: (next: SettingsRecord) => void;
  onHighlight?: (field: SiteSettingsField) => void;
  renderHeroVideo: (variant: "dark" | "light") => React.ReactNode;
  onUploadLogo?: (file: File) => Promise<string>;
  onSave: () => void;
  saving?: boolean;
};

const LOGO_IMAGE_ACCEPT =
  "image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg";
const LOGO_IMAGE_EXT = /\.(png|jpe?g|webp|svg)$/i;
const MAX_LOGO_IMAGE_BYTES = 15 * 1024 * 1024;

function validateLogoImageFile(file: File): string | null {
  if (file.size === 0) return "Пустой файл";
  if (file.size > MAX_LOGO_IMAGE_BYTES) return "Файл слишком большой (макс. 15 МБ)";
  const type = (file.type || "").toLowerCase();
  if (
    type === "image/png" ||
    type === "image/jpeg" ||
    type === "image/webp" ||
    type === "image/svg+xml"
  ) {
    return null;
  }
  if (LOGO_IMAGE_EXT.test(file.name)) return null;
  return "Допустимы только PNG, JPG, WebP или SVG";
}

const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const DEFAULT_COLOR_PICKER_VALUE = "#ef4444";

function normalizeHexColor(value: string): string {
  const trimmed = value.trim();
  if (!HEX_COLOR_RE.test(trimmed)) return "";
  if (trimmed.length === 4) {
    const [r, g, b] = trimmed.slice(1);
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return trimmed.toLowerCase();
}

function getColorPickerValue(value: string | undefined): string {
  const normalized = normalizeHexColor(value ?? "");
  return normalized || DEFAULT_COLOR_PICKER_VALUE;
}

const GROUPS: {
  title: string;
  description?: string;
  fields: { key: SiteSettingsField; label: string; multiline?: boolean; hint?: string }[];
}[] = [
  {
    title: "Бренд и Hero",
    description: "Первый экран и название в шапке",
    fields: [
      { key: "brandName", label: "Название бренда" },
      {
        key: "brandHighlightText",
        label: "Логотип — выделяемые буквы/текст",
        hint: "Примеры: 1,6 (индексы), 2-5 (диапазон), 1,3,7-9 (смешанный), QX (все буквы Q и X). Legacy: letters:, indexes:, step:.",
      },
      {
        key: "brandHighlightColor",
        label: "Логотип — цвет выделения (hex)",
        hint: "Выберите цвет пипеткой или введите hex: #ef4444 / #e44",
      },
      {
        key: "heroTitle",
        label: "Заголовок H1 — белая часть",
        multiline: true,
        hint: "Enter — перенос на новую строку внутри белого текста",
      },
      {
        key: "heroHighlight",
        label: "Заголовок H1 — красная часть",
        multiline: true,
        hint: "Enter — перенос на новую строку внутри красного текста",
      },
      { key: "heroSubtitle", label: "Подзаголовок", multiline: true },
      { key: "heroBenefit1", label: "Преимущество Hero — пункт 1" },
      { key: "heroBenefit2", label: "Преимущество Hero — пункт 2" },
      { key: "heroBenefit3", label: "Преимущество Hero — пункт 3" },
      {
        key: "heroMeta",
        label: "Строка под кнопками Hero",
        hint: "Например: Ответим в течение 2 часов · Без обязательств · NDA по запросу",
      },
    ],
  },
  {
    title: "Статистика",
    fields: [
      { key: "statValue", label: "Число" },
      { key: "statText", label: "Подпись", multiline: true },
    ],
  },
  {
    title: "Контакты в подвале",
    description:
      "Телефоны, email и адреса для карточек в секции контактов. WhatsApp, Telegram и MAX — во вкладке «Форма».",
    fields: [
      { key: "phones", label: "Телефоны", multiline: true },
      { key: "emails", label: "Email", multiline: true },
      { key: "addresses", label: "Адреса", multiline: true },
    ],
  },
  {
    title: "Подвал",
    description:
      "Краткое описание студии и ссылки Behance, GitHub и доп. соцсети внизу страницы.",
    fields: [
      { key: "footerDescriptor", label: "Описание студии", multiline: true },
      { key: "footerCopyright", label: "Копирайт" },
      { key: "footerBehanceUrl", label: "Behance, URL" },
      { key: "footerGithubUrl", label: "GitHub, URL" },
      {
        key: "socialLinks",
        label: "Доп. ссылки (JSON: label, url)",
        multiline: true,
      },
    ],
  },
];

const HIGHLIGHT_FIELDS = new Set<SiteSettingsField>([
  "brandName",
  "brandHighlightText",
  "brandHighlightColor",
  "heroTitle",
  "heroHighlight",
  "heroSubtitle",
  "heroBenefit1",
  "heroBenefit2",
  "heroBenefit3",
  "heroMeta",
  "statValue",
  "statText",
  "phones",
  "emails",
  "addresses",
  "socialLinks",
  "footerCopyright",
  "footerDescriptor",
  "footerBehanceUrl",
  "footerGithubUrl",
]);

export function AdminSettingsPanel({
  settings,
  onChange,
  onHighlight,
  renderHeroVideo,
  onUploadLogo,
  onSave,
  saving,
}: Props) {
  const logoMode = settings.logoMode === "text" ? "text" : "image";
  const logoImageUrl = settings.logoImageUrl?.trim() || DEFAULT_LOGO_IMAGE_URL;
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState("");

  function updateField(key: SiteSettingsField, value: string) {
    onChange({ ...settings, [key]: value });
  }

  function setLogoMode(mode: "text" | "image") {
    onChange({
      ...settings,
      logoMode: mode,
      logoImageUrl: settings.logoImageUrl?.trim() || DEFAULT_LOGO_IMAGE_URL,
    });
  }

  async function handleLogoFileFromDisk(file: File) {
    const validationError = validateLogoImageFile(file);
    if (validationError) {
      setLogoUploadError(validationError);
      return;
    }
    if (!onUploadLogo) {
      setLogoUploadError("Загрузка недоступна");
      return;
    }
    setLogoUploading(true);
    setLogoUploadError("");
    try {
      const url = await onUploadLogo(file);
      onChange({
        ...settings,
        logoMode: "image",
        logoImageUrl: url,
      });
    } catch (e) {
      setLogoUploadError(e instanceof Error ? e.message : "Не удалось загрузить логотип");
    } finally {
      setLogoUploading(false);
    }
  }

  return (
    <div className="admin-panel-stack">
      <section className="admin-card">
        <div className="admin-card-head">
          <h2 className="admin-card-title">Логотип в шапке</h2>
          <p className="admin-card-desc">
            Текстовый вариант слева или картинка справа в шапке сайта
          </p>
        </div>
        <div className="admin-card-body admin-field-grid">
          <fieldset className="admin-field admin-field--full">
            <legend className="admin-field-label">Тип логотипа</legend>
            <div className="admin-logo-mode-options">
              <label className="admin-logo-mode-option">
                <input
                  type="radio"
                  name="logoMode"
                  checked={logoMode === "text"}
                  onChange={() => setLogoMode("text")}
                />
                <span>Текстовый логотип</span>
              </label>
              <label className="admin-logo-mode-option">
                <input
                  type="radio"
                  name="logoMode"
                  checked={logoMode === "image"}
                  onChange={() => setLogoMode("image")}
                />
                <span>Логотип-картинка</span>
              </label>
            </div>
          </fieldset>
          {logoMode === "image" ? (
            <>
              <div className="admin-field admin-field--full">
                <span className="admin-field-label">Превью логотипа</span>
                <div className="admin-logo-preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoImageUrl} alt="" />
                </div>
              </div>
              {onUploadLogo ? (
                <label className="admin-field admin-field--full">
                  <span className="admin-field-label">Загрузить с компьютера</span>
                  <span className="admin-field-hint">PNG, JPG, WebP или SVG, до 15 МБ</span>
                  <input
                    type="file"
                    accept={LOGO_IMAGE_ACCEPT}
                    disabled={logoUploading || saving}
                    className="admin-logo-file-input"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) void handleLogoFileFromDisk(file);
                    }}
                  />
                  {logoUploading ? (
                    <span className="admin-field-hint">Загрузка…</span>
                  ) : null}
                  {logoUploadError ? (
                    <span className="admin-field-hint text-[var(--accent)]">{logoUploadError}</span>
                  ) : null}
                </label>
              ) : null}
              <label className="admin-field admin-field--full">
                <span className="admin-field-label">URL картинки логотипа</span>
                <span className="admin-field-hint">
                  Путь в <code className="text-accent">public</code> или загруженный файл в{" "}
                  <code className="text-accent">/uploads/</code>, например {DEFAULT_LOGO_IMAGE_URL}
                </span>
                <input
                  value={logoImageUrl}
                  onChange={(e) => updateField("logoImageUrl", e.target.value)}
                  placeholder={DEFAULT_LOGO_IMAGE_URL}
                />
              </label>
            </>
          ) : null}
        </div>
      </section>

      {GROUPS.map((group) => (
        <section key={group.title} className="admin-card">
          <div className="admin-card-head">
            <h2 className="admin-card-title">{group.title}</h2>
            {group.description ? <p className="admin-card-desc">{group.description}</p> : null}
          </div>
          <div className="admin-card-body admin-field-grid">
            {group.fields.map(({ key, label, multiline, hint }) => (
              <label key={key} className="admin-field">
                <span className="admin-field-label-row">
                  <span className="admin-field-label">{label}</span>
                  {onHighlight && HIGHLIGHT_FIELDS.has(key) ? (
                    <button
                      type="button"
                      className="admin-field-show"
                      onClick={() => onHighlight(key)}
                      title="Подсветить на превью"
                    >
                      <Eye size={12} />
                      Показать
                    </button>
                  ) : null}
                </span>
                {hint ? <span className="admin-field-hint">{hint}</span> : null}
                {key === "brandHighlightColor" ? (
                  <div className="admin-color-field">
                    <input
                      type="color"
                      className="admin-color-picker"
                      value={getColorPickerValue(settings[key] ?? "")}
                      onChange={(e) => updateField(key, e.target.value)}
                      onFocus={() => onHighlight?.(key)}
                      aria-label="Выбрать цвет выделения логотипа"
                    />
                    <input
                      value={settings[key] ?? ""}
                      onChange={(e) => updateField(key, e.target.value)}
                      onFocus={() => onHighlight?.(key)}
                      placeholder="#ef4444"
                    />
                  </div>
                ) : multiline ? (
                  <textarea
                    rows={key === "socialLinks" ? 6 : key === "heroSubtitle" ? 4 : 3}
                    value={settings[key] ?? ""}
                    onChange={(e) => updateField(key, e.target.value)}
                    onFocus={() => onHighlight?.(key)}
                    className="font-mono text-sm"
                  />
                ) : (
                  <input
                    value={settings[key] ?? ""}
                    onChange={(e) => updateField(key, e.target.value)}
                    onFocus={() => onHighlight?.(key)}
                  />
                )}
                {key === "brandHighlightColor" && settings[key] && !normalizeHexColor(settings[key] ?? "") ? (
                  <span className="admin-field-hint">Некорректный цвет: используйте формат #rgb или #rrggbb.</span>
                ) : null}
              </label>
            ))}
          </div>
        </section>
      ))}

      <section className="admin-card">
        <div className="admin-card-head">
          <h2 className="admin-card-title">Фон Hero — видео</h2>
          <p className="admin-card-desc">
            Отдельные ролики для тёмной и светлой темы. Файлы в <code className="text-accent">public/video</code>
          </p>
        </div>
        <div className="admin-card-body admin-field-grid admin-field-grid--2">
          {renderHeroVideo("dark")}
          {renderHeroVideo("light")}
        </div>
      </section>

      <div className="admin-sticky-save">
        <button type="button" className="btn-primary" disabled={saving} onClick={onSave}>
          {saving ? "Сохранение…" : "Сохранить настройки сайта"}
        </button>
      </div>
    </div>
  );
}
