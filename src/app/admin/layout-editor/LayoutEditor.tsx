"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetchJson } from "@/lib/admin-fetch-json";
import {
  DEFAULT_SPACING,
  parseSpacingConfig,
  SECTION_IDS,
  SECTION_LABELS,
  type SectionId,
  type SpacingConfig,
} from "@/lib/section-spacing";

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  return adminFetchJson<T>(url, init);
}

export function LayoutEditor() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [spacing, setSpacing] = useState<SpacingConfig>(DEFAULT_SPACING);
  const [active, setActive] = useState<SectionId>("hero");
  const [msg, setMsg] = useState("");
  const [previewReady, setPreviewReady] = useState(false);

  const pushPreview = useCallback((config: SpacingConfig, highlight?: SectionId) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "SPACING_PREVIEW", spacing: config, highlight },
      window.location.origin,
    );
  }, []);

  useEffect(() => {
    api<Record<string, string>>("/api/admin/settings")
      .then((data) => setSpacing(parseSpacingConfig(data.sectionSpacing)))
      .catch((e) => setMsg(String(e)));
  }, []);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "SPACING_PREVIEW_READY") setPreviewReady(true);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (previewReady) pushPreview(spacing);
  }, [previewReady, spacing, pushPreview]);

  function updateSection(id: SectionId, field: "paddingTop" | "paddingBottom", value: number) {
    setSpacing((prev) => {
      const next = { ...prev, [id]: { ...prev[id], [field]: value } };
      pushPreview(next, id);
      return next;
    });
  }

  async function save() {
    setMsg("");
    try {
      await api("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionSpacing: JSON.stringify(spacing) }),
      });
      setMsg("Отступы сохранены на сайте");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Не удалось сохранить");
    }
  }

  return (
    <div className="flex h-screen flex-col bg-[var(--bg)] text-white">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <div>
          <h1 className="text-lg font-bold">Структура и отступы</h1>
          <p className="text-xs text-[var(--text-muted)]">Меняйте ползунки — сайт справа обновляется сразу</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin" className="btn-outline text-sm">
            ← Админка
          </Link>
          <button
            type="button"
            className="btn-outline text-sm"
            onClick={() => {
              setSpacing(DEFAULT_SPACING);
              pushPreview(DEFAULT_SPACING);
            }}
          >
            Сброс
          </button>
          <button type="button" className="btn-primary text-sm" onClick={() => void save()}>
            Сохранить
          </button>
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
        </div>
      </header>

      {msg && <p className="shrink-0 bg-green-900/30 px-4 py-2 text-sm text-green-400">{msg}</p>}

      <div className="flex min-h-0 flex-1">
        <aside className="w-full max-w-sm shrink-0 overflow-y-auto border-r border-[var(--border)] p-4">
          <div className="space-y-3">
            {SECTION_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setActive(id);
                  pushPreview(spacing, id);
                }}
                className={`w-full rounded-[var(--radius)] border p-3 text-left transition ${
                  active === id
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/50"
                }`}
              >
                <p className="mb-3 text-sm font-semibold">{SECTION_LABELS[id]}</p>
                <label className="mb-2 block text-xs text-[var(--text-muted)]">
                  Сверху: {spacing[id].paddingTop}px
                  <input
                    type="range"
                    min={0}
                    max={200}
                    step={4}
                    value={spacing[id].paddingTop}
                    className="mt-1 w-full accent-[var(--accent)]"
                    onChange={(e) => updateSection(id, "paddingTop", Number(e.target.value))}
                  />
                </label>
                <label className="block text-xs text-[var(--text-muted)]">
                  Снизу: {spacing[id].paddingBottom}px
                  <input
                    type="range"
                    min={0}
                    max={200}
                    step={4}
                    value={spacing[id].paddingBottom}
                    className="mt-1 w-full accent-[var(--accent)]"
                    onChange={(e) => updateSection(id, "paddingBottom", Number(e.target.value))}
                  />
                </label>
              </button>
            ))}
          </div>
        </aside>

        <div className="relative min-w-0 flex-1 bg-[var(--bg-deep)]">
          {!previewReady && (
            <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-[var(--text-muted)]">
              Загрузка превью…
            </div>
          )}
          <iframe ref={iframeRef} title="Превью сайта" src="/?preview=spacing" className="h-full w-full border-0" />
        </div>
      </div>
    </div>
  );
}
