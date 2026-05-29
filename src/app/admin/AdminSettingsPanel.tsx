"use client";

import { Eye } from "lucide-react";
import type { SiteSettingsField } from "@/lib/site-settings-fields";

type SettingsRecord = Partial<Record<SiteSettingsField, string>>;

type Props = {
  settings: SettingsRecord;
  onChange: (next: SettingsRecord) => void;
  onHighlight?: (field: SiteSettingsField) => void;
  renderHeroVideo: (variant: "dark" | "light") => React.ReactNode;
  onSave: () => void;
  saving?: boolean;
};

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
      { key: "heroTitle", label: "Заголовок — первая строка" },
      { key: "heroHighlight", label: "Заголовок — акцент (красный)" },
      { key: "heroSubtitle", label: "Подзаголовок", multiline: true },
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
    description: "JSON-массивы: телефоны, email, адреса, соцсети",
    fields: [
      { key: "phones", label: "Телефоны", multiline: true },
      { key: "emails", label: "Email", multiline: true },
      { key: "addresses", label: "Адреса", multiline: true },
      { key: "socialLinks", label: "Соцсети (label, url)", multiline: true },
    ],
  },
  {
    title: "Подвал",
    fields: [{ key: "footerCopyright", label: "Копирайт" }],
  },
];

const HIGHLIGHT_FIELDS = new Set<SiteSettingsField>([
  "brandName",
  "brandHighlightText",
  "brandHighlightColor",
  "heroTitle",
  "heroHighlight",
  "heroSubtitle",
  "heroMeta",
  "statValue",
  "statText",
  "phones",
  "emails",
  "addresses",
  "socialLinks",
  "footerCopyright",
]);

export function AdminSettingsPanel({ settings, onChange, onHighlight, renderHeroVideo, onSave, saving }: Props) {
  function updateField(key: SiteSettingsField, value: string) {
    onChange({ ...settings, [key]: value });
  }

  return (
    <div className="admin-panel-stack">
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
