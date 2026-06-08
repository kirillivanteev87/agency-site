"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetchJson } from "@/lib/admin-fetch-json";
import {
  ADMIN_PREVIEW_PATHS,
  type AdminDashboardTab,
} from "@/lib/admin-preview-paths";
import {
  pickSiteSettingsPayload,
  SITE_SETTINGS_FIELDS,
  type SiteSettingsField,
} from "@/lib/site-settings-fields";
import {
  ensureStoredButtonLabelsJson,
  normalizeButtonLabelsForSave,
  parseButtonLabels,
  serializeButtonLabels,
  type ButtonLabels,
} from "@/lib/button-labels";
import { AdminButtonsPanel } from "./AdminButtonsPanel";
import { AdminListPanel } from "./AdminListPanel";
import { AdminContactPanel } from "./AdminContactPanel";
import { AdminPricingPanel } from "./AdminPricingPanel";
import { AdminSettingsPanel } from "./AdminSettingsPanel";
import { AdminShell } from "./AdminShell";
import { AdminSitePreview } from "./AdminSitePreview";
import { SubmissionsInbox, type SubmissionRow } from "./SubmissionsInbox";
import { useSitePreview } from "./useSitePreview";

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  return adminFetchJson<T>(url, init);
}

function normalizeSettings(data: Record<string, unknown>): Partial<Record<SiteSettingsField, string>> {
  const out: Partial<Record<SiteSettingsField, string>> = {};
  for (const key of SITE_SETTINGS_FIELDS) {
    const raw = data[key];
    out[key] = raw !== undefined && raw !== null ? String(raw) : "";
  }
  if (out.buttonLabels !== undefined) {
    out.buttonLabels = ensureStoredButtonLabelsJson(out.buttonLabels);
  }
  return out;
}

const TAB_META: Record<
  AdminDashboardTab,
  { title: string; subtitle: string; hidePreview?: boolean }
> = {
  settings: {
    title: "Настройки сайта",
    subtitle: "Бренд, Hero, контакты — изменения видны в превью справа",
  },
  buttons: {
    title: "Кнопки",
    subtitle: "Подписи на всех CTA — сразу видно в превью справа",
  },
  hero: {
    title: "Блоки Hero",
    subtitle: "Карточки на первом экране под заголовком",
  },
  services: {
    title: "Услуги",
    subtitle: "Карточки в секции «Услуги»",
  },
  pricing: {
    title: "Тарифы",
    subtitle: "Пакеты и цены перед FAQ на главной",
  },
  contact: {
    title: "Форма заявки",
    subtitle: "Заголовок секции «Контакты», карточки и поля формы на главной",
  },
  marketplace: {
    title: "Marketplace",
    subtitle: "Продукты по подписке на /marketplace",
  },
  faq: {
    title: "FAQ",
    subtitle: "Вопросы и ответы на главной",
  },
  messages: {
    title: "Заявки",
    subtitle: "Обращения с формы и AI-чата",
    hidePreview: true,
  },
};

export function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<AdminDashboardTab>("settings");
  const [settings, setSettings] = useState<Partial<Record<SiteSettingsField, string>> | null>(null);
  const [list, setList] = useState<Record<string, unknown>[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [heroVideoUploading, setHeroVideoUploading] = useState<"dark" | "light" | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [emailTesting, setEmailTesting] = useState(false);
  const [emailTestMsg, setEmailTestMsg] = useState("");
  const [emailTestError, setEmailTestError] = useState("");
  const [buttonsSyncKey, setButtonsSyncKey] = useState(0);

  const resourceMap: Record<Exclude<AdminDashboardTab, "settings" | "buttons" | "contact">, string> = {
    services: "services",
    pricing: "pricing-plans",
    marketplace: "marketplace-apps",
    faq: "faqs",
    hero: "hero-features",
    messages: "submissions",
  };

  const previewSettings = useMemo(() => {
    if (!settings) return null;
    const out: Record<string, string> = {};
    for (const key of SITE_SETTINGS_FIELDS) {
      out[key] = settings[key] ?? "";
    }
    return out;
  }, [settings]);

  const livePreview = tab === "settings" || tab === "buttons" || tab === "contact";
  const { iframeRef, ready, reloadKey, highlightField, highlightButton, reloadPreview } = useSitePreview(
    previewSettings,
    livePreview,
  );

  const previewPath = ADMIN_PREVIEW_PATHS[tab];
  const hidePreview = TAB_META[tab].hidePreview;

  const load = useCallback(async () => {
    setMsg("");
    setError("");
    if (tab === "settings" || tab === "buttons" || tab === "contact") {
      setListLoading(false);
      const data = await api<Record<string, unknown>>("/api/admin/settings");
      setSettings(normalizeSettings(data));
      if (tab === "buttons") setButtonsSyncKey((k) => k + 1);
      return;
    }
    setList([]);
    setListLoading(true);
    try {
      const data = await api<Record<string, unknown>[]>(`/api/admin/${resourceMap[tab]}`);
      setList(data);
    } finally {
      setListLoading(false);
    }
  }, [tab]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await api<{ count: number }>("/api/admin/submissions/unread-count");
      setUnreadCount(data.count);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    load().catch((e) => setError(String(e)));
  }, [load]);

  useEffect(() => {
    reloadPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- перезагрузка iframe при смене раздела
  }, [tab]);

  useEffect(() => {
    void fetchUnreadCount();
    const timer = window.setInterval(() => void fetchUnreadCount(), 30_000);
    return () => window.clearInterval(timer);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (tab !== "messages") return;
    void api("/api/admin/submissions/mark-read", { method: "POST" })
      .then(() => setUnreadCount(0))
      .catch(() => {});
  }, [tab]);

  const parsedButtonLabels = useMemo(
    () => parseButtonLabels(settings?.buttonLabels),
    [settings?.buttonLabels],
  );

  async function saveButtonLabels(labels: ButtonLabels) {
    if (!settings) return;
    setSaving(true);
    setError("");
    const serialized = serializeButtonLabels(normalizeButtonLabelsForSave(labels));
    try {
      const payload = pickSiteSettingsPayload({ buttonLabels: serialized });
      if (!payload.buttonLabels) {
        throw new Error("Не удалось подготовить данные кнопок для сохранения");
      }
      const saved = await api<Record<string, unknown>>("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const normalized = normalizeSettings(saved);
      normalized.buttonLabels = ensureStoredButtonLabelsJson(
        String(saved.buttonLabels ?? serialized),
      );
      setSettings(normalized);
      setButtonsSyncKey((k) => k + 1);
      setMsg("Тексты кнопок сохранены");
      router.refresh();
      reloadPreview();
    } catch (e) {
      setMsg("");
      setError(e instanceof Error ? e.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  async function saveSettings() {
    if (!settings) return;
    setSaving(true);
    setError("");
    try {
      const payload = pickSiteSettingsPayload(settings as Record<string, unknown>);
      const saved = await api<Record<string, unknown>>("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSettings(normalizeSettings(saved));
      setMsg("Настройки сохранены");
      router.refresh();
      reloadPreview();
    } catch (e) {
      setMsg("");
      setError(e instanceof Error ? e.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  async function uploadFile(file: File, category: "image" | "video" = "image") {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("category", category);
    const res = await api<{ url: string }>("/api/upload", { method: "POST", body: fd });
    return res.url;
  }

  async function uploadHeroVideoFromDisk(file: File, variant: "dark" | "light") {
    if (!settings) {
      setError("Настройки ещё не загрузились — подождите секунду.");
      return;
    }
    setHeroVideoUploading(variant);
    setError("");
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("variant", variant);
      const saved = await api<{
        url: string;
        heroVideoUrl: string;
        heroVideoUrlLight: string;
      }>("/api/admin/hero-video", { method: "POST", body: fd });

      const field = variant === "light" ? "heroVideoUrlLight" : "heroVideoUrl";
      const nextUrl = (saved[field] ?? saved.url ?? "").trim();
      if (!nextUrl) throw new Error("Сервер не вернул URL видео.");

      setSettings({ ...settings, [field]: nextUrl });
      setMsg(variant === "light" ? "Видео для светлой темы сохранено" : "Видео для тёмной темы сохранено");
      router.refresh();
      reloadPreview();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось загрузить видео");
    } finally {
      setHeroVideoUploading(null);
    }
  }

  async function saveHeroVideoUrl(variant: "dark" | "light") {
    if (!settings) return;
    const field = variant === "light" ? "heroVideoUrlLight" : "heroVideoUrl";
    setError("");
    try {
      const payload = pickSiteSettingsPayload({ [field]: settings[field] ?? "" });
      const saved = await api<Record<string, unknown>>("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSettings({ ...settings, [field]: String(saved[field] ?? settings[field] ?? "") });
      setMsg("URL видео сохранён");
      router.refresh();
      reloadPreview();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить URL");
    }
  }

  function renderHeroVideoField(variant: "dark" | "light") {
    if (!settings) return null;
    const field = variant === "light" ? "heroVideoUrlLight" : "heroVideoUrl";
    const title = variant === "light" ? "Светлая тема" : "Тёмная тема";
    const uploading = heroVideoUploading === variant;

    return (
      <div className="space-y-2 rounded-[calc(var(--radius)-4px)] border border-[var(--border)] bg-[var(--input-bg)] p-3">
        <p className="text-sm font-semibold">{title}</p>
        <label className="admin-field">
          <span className="admin-field-label">URL видео</span>
          <input
            value={settings[field] ?? ""}
            onChange={(e) => setSettings({ ...settings, [field]: e.target.value })}
            placeholder="/video/…"
          />
        </label>
        <button type="button" className="btn-outline w-full text-sm" onClick={() => void saveHeroVideoUrl(variant)}>
          Сохранить URL
        </button>
        <label className="admin-field">
          <span className="admin-field-label">Загрузить файл</span>
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
            disabled={heroVideoUploading !== null}
            className="text-sm file:mr-2 file:rounded file:border-0 file:bg-[var(--accent)] file:px-2 file:py-1 file:text-xs file:text-white"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void uploadHeroVideoFromDisk(file, variant);
            }}
          />
        </label>
        {uploading ? <p className="text-xs text-[var(--text-muted)]">Загрузка…</p> : null}
      </div>
    );
  }

  async function createItem() {
    const resource = resourceMap[tab as Exclude<AdminDashboardTab, "settings" | "buttons" | "contact">];
    const templates: Record<string, Record<string, unknown>> = {
      services: { icon: "layout", title: "Услуга", description: "", sortOrder: list.length },
      "marketplace-apps": {
        title: "Новое приложение",
        description: "Краткое описание для карточки",
        imageUrl: "",
        priceLabel: "от 9 900 ₽/мес",
        badge: "",
        category: "ready",
        icon: "layout",
        features: JSON.stringify(["Функция 1", "Функция 2"]),
        featured: false,
        published: true,
        sortOrder: list.length,
      },
      "pricing-plans": {
        name: "Новый тариф",
        eyebrow: "",
        summary: "",
        audienceLabel: "",
        outcomeText: "",
        price: "0",
        features: JSON.stringify(["Пункт списка"]),
        featured: false,
        badgeLabel: "",
        sortOrder: list.length,
      },
      faqs: { question: "Вопрос?", answer: "Ответ", sortOrder: list.length },
      "hero-features": { title: "Блок", subtitle: "", icon: "sparkles", variant: "default", sortOrder: list.length },
    };
    await api(`/api/admin/${resource}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(templates[resource]),
    });
    await load();
    reloadPreview();
  }

  async function updateItem(id: number, data: Record<string, unknown>) {
    setError("");
    try {
      const resource = resourceMap[tab as Exclude<AdminDashboardTab, "settings" | "buttons" | "contact">];
      await api(`/api/admin/${resource}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await load();
      setMsg("Сохранено");
      router.refresh();
      reloadPreview();
    } catch (e) {
      setMsg("");
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    }
  }

  async function deleteItem(id: number) {
    if (!confirm("Удалить?")) return;
    const resource = resourceMap[tab as Exclude<AdminDashboardTab, "settings" | "buttons" | "contact">];
    await api(`/api/admin/${resource}/${id}`, { method: "DELETE" });
    await load();
    reloadPreview();
  }

  async function testLeadEmail() {
    setEmailTesting(true);
    setEmailTestMsg("");
    setEmailTestError("");
    try {
      const res = await api<{ ok: boolean; message: string }>("/api/admin/email-test", { method: "POST" });
      setEmailTestMsg(res.message);
    } catch (e) {
      setEmailTestError(e instanceof Error ? e.message : "Не удалось отправить тест");
    } finally {
      setEmailTesting(false);
    }
  }

  const meta = TAB_META[tab];

  return (
    <AdminShell
      activeTab={tab}
      onTabChange={setTab}
      unreadCount={unreadCount}
      title={meta.title}
      subtitle={meta.subtitle}
      hidePreview={hidePreview}
      preview={
        <AdminSitePreview
          tab={tab}
          previewSrc={previewPath}
          iframeRef={iframeRef}
          ready={ready || !livePreview}
          reloadKey={reloadKey}
          onReload={reloadPreview}
          hidden={hidePreview}
        />
      }
    >
      {msg ? <p className="admin-alert admin-alert--ok">{msg}</p> : null}
      {error ? <p className="admin-alert admin-alert--err">{error}</p> : null}

      {tab === "buttons" && settings ? (
        <AdminButtonsPanel
          labels={parsedButtonLabels}
          syncKey={buttonsSyncKey}
          onChange={(next) =>
            setSettings((prev) =>
              prev ? { ...prev, buttonLabels: serializeButtonLabels(next) } : prev,
            )
          }
          onHighlight={livePreview ? highlightButton : undefined}
          onSave={(labels) => void saveButtonLabels(labels)}
          saving={saving}
        />
      ) : null}

      {tab === "settings" && settings ? (
        <AdminSettingsPanel
          settings={settings}
          onChange={setSettings}
          onHighlight={livePreview ? highlightField : undefined}
          renderHeroVideo={renderHeroVideoField}
          onSave={() => void saveSettings()}
          saving={saving}
        />
      ) : null}

      {tab === "messages" ? (
        <>
          <section className="admin-card mb-4">
            <div className="admin-card-body flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 text-sm text-[var(--text-muted)]">
                <p className="font-medium text-[var(--text)]">Уведомления на почту</p>
                <p className="mt-1 text-xs">
                  Настройки в <code className="text-accent">.env</code> (SMTP_* и LEAD_NOTIFY_EMAIL)
                </p>
              </div>
              <button
                type="button"
                className="btn-outline shrink-0 text-sm"
                disabled={emailTesting}
                onClick={() => void testLeadEmail()}
              >
                {emailTesting ? "Отправка…" : "Проверить почту"}
              </button>
              {emailTestMsg ? <p className="w-full text-sm text-green-400">{emailTestMsg}</p> : null}
              {emailTestError ? <p className="w-full text-sm text-red-400">{emailTestError}</p> : null}
            </div>
          </section>
          {listLoading ? (
            <p className="admin-card admin-card--placeholder">Загрузка заявок…</p>
          ) : (
            <div className="admin-inbox-wide">
            <SubmissionsInbox
              items={list.map((row) => ({
                id: Number(row.id),
                name: String(row.name),
                email: String(row.email),
                phone: String(row.phone ?? ""),
                message: String(row.message),
                createdAt: String(row.createdAt),
                read: Boolean(row.read),
              })) as SubmissionRow[]}
              onRefresh={load}
              onUnreadRefresh={fetchUnreadCount}
            />
            </div>
          )}
        </>
      ) : null}

      {tab === "services" ? (
        <AdminListPanel
          items={list}
          loading={listLoading}
          emptyLabel="Нет услуг — добавьте первую"
          addLabel="Добавить"
          getItemTitle={(i) => String(i.title ?? "Без названия")}
          getItemMeta={(i) => String(i.description ?? "").slice(0, 48)}
          fields={["icon", "title", "description", "sortOrder"]}
          onAdd={createItem}
          onSave={updateItem}
          onDelete={deleteItem}
        />
      ) : null}

      {tab === "marketplace" ? (
        <AdminListPanel
          items={list}
          loading={listLoading}
          emptyLabel="Нет продуктов"
          addLabel="Продукт"
          getItemTitle={(i) => String(i.title ?? "")}
          getItemMeta={(i) => String(i.priceLabel ?? "")}
          fieldGroups={[
            {
              label: "Карточка",
              fields: [
                "title",
                "description",
                "imageUrl",
                "priceLabel",
                "badge",
                "icon",
                "category",
                "sortOrder",
              ],
            },
            { label: "Подписка", fields: ["features"] },
            { label: "Публикация", fields: ["featured", "published"] },
          ]}
          onAdd={createItem}
          onSave={updateItem}
          onDelete={deleteItem}
          onUpload={uploadFile}
        />
      ) : null}

      {tab === "contact" && settings ? (
        <AdminContactPanel
          settings={settings}
          onChange={setSettings}
          onHighlight={livePreview ? highlightField : undefined}
          onSave={() => void saveSettings()}
          saving={saving}
        />
      ) : null}

      {tab === "pricing" ? (
        <AdminPricingPanel
          items={list}
          loading={listLoading}
          onAdd={createItem}
          onSave={updateItem}
          onDelete={deleteItem}
          onSectionSaved={() => {
            setMsg("Сохранено");
            reloadPreview();
            router.refresh();
          }}
        />
      ) : null}

      {tab === "faq" ? (
        <AdminListPanel
          items={list}
          loading={listLoading}
          emptyLabel="Нет вопросов"
          addLabel="Вопрос"
          getItemTitle={(i) => String(i.question ?? "")}
          fields={["question", "answer", "sortOrder"]}
          onAdd={createItem}
          onSave={updateItem}
          onDelete={deleteItem}
        />
      ) : null}

      {tab === "hero" ? (
        <AdminListPanel
          items={list}
          loading={listLoading}
          emptyLabel="Нет блоков Hero"
          addLabel="Блок"
          getItemTitle={(i) => String(i.title ?? "")}
          getItemMeta={(i) => String(i.subtitle ?? "")}
          fields={["title", "subtitle", "icon", "variant", "imageUrl", "sortOrder"]}
          onAdd={createItem}
          onSave={updateItem}
          onDelete={deleteItem}
          onUpload={uploadFile}
        />
      ) : null}
    </AdminShell>
  );
}
