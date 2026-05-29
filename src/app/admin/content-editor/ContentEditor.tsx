"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetchJson } from "@/lib/admin-fetch-json";
import type { ContentHighlightField } from "@/lib/content-preview-apply";
import {
  pickSiteSettingsPayload,
  SITE_SETTINGS_FIELDS,
  type SiteSettingsField,
} from "@/lib/site-settings-fields";

const TEXT_EDITOR_FIELDS = SITE_SETTINGS_FIELDS.filter(
  (f) => f !== "sectionSpacing",
) as readonly SiteSettingsField[];

const LABELS: Record<string, string> = {
  brandName: "Название бренда",
  brandHighlightText: "Логотип — выделяемые буквы/текст",
  brandHighlightColor: "Логотип — цвет выделения (hex)",
  heroTitle: "Hero — главная строка заголовка",
  heroHighlight: "Hero — акцентная строка (красная)",
  heroSubtitle: "Hero — подзаголовок",
  heroMeta: "Hero — строка под кнопками",
  heroVideoUrl: "Hero — URL видео (тёмная тема)",
  heroVideoUrlLight: "Hero — URL видео (светлая тема)",
  statValue: "Блок статистики — число",
  statText: "Блок статистики — текст",
  phones: "Телефоны (JSON массив строк)",
  emails: "Email (JSON массив)",
  addresses: "Адреса (JSON массив строк)",
  socialLinks: "Соцсети (JSON: label, url)",
  footerCopyright: "Копирайт в подвале",
};

const BRAND_HIGHLIGHT_HELP =
  "Примеры: 1,6 (индексы), 2-5 (диапазон), 1,3,7-9 (смешанный), QX (все буквы Q и X). Legacy: letters:, indexes:, step:.";
const BRAND_HIGHLIGHT_COLOR_HELP = "Выберите цвет пипеткой или введите hex: #ef4444 / #e44";
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

const JSON_LIKE_FIELDS = new Set<SiteSettingsField>([
  "phones",
  "emails",
  "addresses",
  "socialLinks",
]);

const HIGHLIGHT_BY_FIELD: Partial<Record<SiteSettingsField, ContentHighlightField>> = {
  brandName: "brandName",
  brandHighlightText: "brandHighlightText",
  brandHighlightColor: "brandHighlightColor",
  heroTitle: "heroTitle",
  heroHighlight: "heroHighlight",
  heroSubtitle: "heroSubtitle",
  heroMeta: "heroMeta",
  statValue: "statValue",
  statText: "statText",
  footerCopyright: "footerCopyright",
  phones: "phones",
  emails: "emails",
  addresses: "addresses",
  socialLinks: "socialLinks",
};

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  return adminFetchJson<T>(url, init);
}

function normalizeLoaded(data: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of SITE_SETTINGS_FIELDS) {
    const v = data[key];
    if (v !== undefined && v !== null) {
      out[key] = String(v);
    } else {
      out[key] = "";
    }
  }
  return out;
}

export function ContentEditor() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const [msg, setMsg] = useState("");
  const previewTimerRef = useRef<number | undefined>(undefined);

  const pushPreview = useCallback((settings: Record<string, string>) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "CONTENT_PREVIEW", settings },
      window.location.origin,
    );
  }, []);

  useEffect(() => {
    api<Record<string, unknown>>("/api/admin/settings")
      .then((data) => setDraft(normalizeLoaded(data)))
      .catch((e) => setMsg(String(e)));
  }, []);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "CONTENT_PREVIEW_READY") {
        setPreviewReady(true);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!previewReady || !draft) return;

    window.clearTimeout(previewTimerRef.current);
    previewTimerRef.current = window.setTimeout(() => pushPreview(draft), 140);
    return () => window.clearTimeout(previewTimerRef.current);
  }, [draft, previewReady, pushPreview]);

  async function save() {
    if (!draft) return;
    setMsg("");
    try {
      const payload = pickSiteSettingsPayload(draft as Record<string, unknown>);
      await api("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      router.refresh();
      setMsg("Сохранено — тексты обновятся для всех посетителей");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Не удалось сохранить");
    }
  }

  function updateField(field: SiteSettingsField, value: string) {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  function emitHighlight(field: SiteSettingsField) {
    const target = HIGHLIGHT_BY_FIELD[field];
    if (!target || !previewReady || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      { type: "CONTENT_PREVIEW_HIGHLIGHT", field: target },
      window.location.origin,
    );
  }

  function renderControl(field: SiteSettingsField) {
    if (!draft) return null;

    const inputId = `ce-${field}`;
    const value = draft[field] ?? "";

    if (JSON_LIKE_FIELDS.has(field)) {
      return (
        <textarea
          id={inputId}
          value={value}
          spellCheck={false}
          rows={field === "socialLinks" ? 8 : 5}
          className="mt-2 min-h-[5rem] w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 font-mono text-sm text-[var(--text)]"
          onChange={(e) => updateField(field, e.target.value)}
          onFocus={() => emitHighlight(field)}
        />
      );
    }

    if (field === "heroSubtitle") {
      return (
        <textarea
          id={inputId}
          value={value}
          rows={5}
          className="mt-2 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-[var(--text)]"
          onChange={(e) => updateField(field, e.target.value)}
          onFocus={() => emitHighlight(field)}
        />
      );
    }

    if (field === "brandHighlightColor") {
      const normalized = normalizeHexColor(value);
      return (
        <>
          <div className="mt-2 grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-2">
            <input
              id={inputId}
              type="color"
              value={normalized || DEFAULT_COLOR_PICKER_VALUE}
              className="h-10 w-11 cursor-pointer rounded-[calc(var(--radius)-4px)] border border-[var(--border)] bg-[var(--bg-card)] p-1"
              onChange={(e) => updateField(field, e.target.value)}
              onFocus={() => emitHighlight(field)}
              aria-label="Выбрать цвет выделения логотипа"
            />
            <input
              type="text"
              value={value}
              placeholder="#ef4444"
              className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-[var(--text)]"
              onChange={(e) => updateField(field, e.target.value)}
              onFocus={() => emitHighlight(field)}
            />
          </div>
          {value && !normalized ? (
            <p className="mt-2 text-[11px] leading-relaxed text-amber-300">
              Некорректный цвет: используйте формат #rgb или #rrggbb.
            </p>
          ) : null}
        </>
      );
    }

    return (
      <input
        id={inputId}
        type="text"
        value={value}
        spellCheck
        className="mt-2 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-[var(--text)]"
        onChange={(e) => updateField(field, e.target.value)}
        onFocus={() => emitHighlight(field)}
      />
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[var(--bg)] text-white">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <div>
          <h1 className="text-lg font-bold">Тексты на сайте</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Пишите слева — превью справа обновляется; «Показать» подсвечивает блок на сайте
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin" className="btn-outline text-sm">
            ← Дашборд
          </Link>
          <button
            type="button"
            className="btn-outline text-sm"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/admin/login");
            }}
          >
            Выйти
          </button>
          <button type="button" className="btn-primary text-sm" onClick={() => void save()} disabled={!draft}>
            Сохранить
          </button>
        </div>
      </header>

      {msg ? (
        <p
          className={`shrink-0 px-4 py-2 text-sm ${msg.includes("Сохранено") ? "text-green-400" : "text-amber-200"}`}
        >
          {msg}
        </p>
      ) : null}

      <div className="flex min-h-0 flex-1">
        <aside className="w-full max-w-md shrink-0 space-y-4 overflow-y-auto border-r border-[var(--border)] p-4">
          {!draft ? (
            <p className="text-sm text-[var(--text-muted)]">Загрузка…</p>
          ) : (
            TEXT_EDITOR_FIELDS.map((field) => {
              const high = HIGHLIGHT_BY_FIELD[field];
              const inputId = `ce-${field}`;

              return (
                <div
                  key={field}
                  className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <label htmlFor={inputId} className="text-xs font-semibold text-[var(--text-muted)]">
                      {LABELS[field] ?? field}
                    </label>
                    {high ? (
                      <button
                        type="button"
                        className="shrink-0 rounded border border-[var(--accent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent hover:bg-[var(--accent)]/15"
                        onClick={() => emitHighlight(field)}
                      >
                        Показать
                      </button>
                    ) : field === "heroVideoUrl" || field === "heroVideoUrlLight" ? (
                      <span className="text-[10px] text-[var(--text-muted)]">В превью не отображается</span>
                    ) : null}
                  </div>
                  {renderControl(field)}
                  {field === "brandHighlightText" ? (
                    <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
                      {BRAND_HIGHLIGHT_HELP}
                    </p>
                  ) : field === "brandHighlightColor" ? (
                    <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
                      {BRAND_HIGHLIGHT_COLOR_HELP}
                    </p>
                  ) : null}
                </div>
              );
            })
          )}
        </aside>

        <div className="relative min-w-0 flex-1 bg-[var(--bg-deep)]">
          {!previewReady && draft ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-[var(--text-muted)]">
              Загрузка превью…
            </div>
          ) : null}
          <iframe
            ref={iframeRef}
            title="Превью сайта — тексты"
            src="/?preview=content"
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
