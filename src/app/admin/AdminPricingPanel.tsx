"use client";

import { useEffect, useState } from "react";
import { adminFetchJson } from "@/lib/admin-fetch-json";
import { pickSiteSettingsPayload, type SiteSettingsField } from "@/lib/site-settings-fields";
import { AdminListPanel } from "./AdminListPanel";

const SECTION_FIELDS = [
  "pricingEyebrow",
  "pricingTitle",
  "pricingSubtitle",
  "pricingNote",
] as const satisfies readonly SiteSettingsField[];

const SECTION_LABELS: Record<(typeof SECTION_FIELDS)[number], string> = {
  pricingEyebrow: "Подпись над заголовком",
  pricingTitle: "Заголовок секции",
  pricingSubtitle: "Подзаголовок",
  pricingNote: "Текст под карточками",
};

type Props = {
  items: Record<string, unknown>[];
  loading: boolean;
  onAdd: () => Promise<void>;
  onSave: (id: number, data: Record<string, unknown>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onSectionSaved?: () => void;
};

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  return adminFetchJson<T>(url, init);
}

export function AdminPricingPanel({
  items,
  loading,
  onAdd,
  onSave,
  onDelete,
  onSectionSaved,
}: Props) {
  const [section, setSection] = useState<Record<string, string> | null>(null);
  const [sectionMsg, setSectionMsg] = useState("");
  const [sectionSaving, setSectionSaving] = useState(false);

  useEffect(() => {
    api<Record<string, unknown>>("/api/admin/settings")
      .then((data) => {
        const draft: Record<string, string> = {};
        for (const key of SECTION_FIELDS) {
          draft[key] = data[key] != null ? String(data[key]) : "";
        }
        setSection(draft);
      })
      .catch((e) => setSectionMsg(String(e)));
  }, []);

  async function saveSection() {
    if (!section) return;
    setSectionSaving(true);
    setSectionMsg("");
    try {
      const payload = pickSiteSettingsPayload(section);
      await api("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSectionMsg("Заголовок секции сохранён");
      onSectionSaved?.();
    } catch (e) {
      setSectionMsg(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSectionSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="admin-card">
        <div className="admin-card-body space-y-4">
          <div>
            <p className="text-sm font-semibold">Заголовок секции «Тарифы»</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Тексты над карточками и примечание внизу блока на главной
            </p>
          </div>
          {section ? (
            <>
              {SECTION_FIELDS.map((key) => (
                <label key={key} className="admin-field block">
                  <span className="admin-field-label">{SECTION_LABELS[key]}</span>
                  {key === "pricingSubtitle" || key === "pricingNote" ? (
                    <textarea
                      rows={key === "pricingNote" ? 3 : 2}
                      value={section[key]}
                      onChange={(e) => setSection({ ...section, [key]: e.target.value })}
                    />
                  ) : (
                    <input
                      value={section[key]}
                      onChange={(e) => setSection({ ...section, [key]: e.target.value })}
                    />
                  )}
                </label>
              ))}
              <button
                type="button"
                className="btn-primary text-sm"
                disabled={sectionSaving}
                onClick={() => void saveSection()}
              >
                {sectionSaving ? "Сохранение…" : "Сохранить заголовок"}
              </button>
            </>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">Загрузка…</p>
          )}
          {sectionMsg ? (
            <p
              className={`text-sm ${sectionMsg.includes("Ошибка") ? "text-red-400" : "text-green-400"}`}
            >
              {sectionMsg}
            </p>
          ) : null}
        </div>
      </section>

      <AdminListPanel
        items={items}
        loading={loading}
        emptyLabel="Нет тарифов — добавьте первый"
        addLabel="Тариф"
        getItemTitle={(i) => String(i.name ?? "Без названия")}
        getItemMeta={(i) => `${String(i.price ?? "")} ₽`.trim()}
        fieldGroups={[
          {
            label: "Тариф",
            fields: ["name", "eyebrow", "summary", "audienceLabel", "outcomeText", "price", "sortOrder"],
          },
          { label: "Оформление", fields: ["featured", "badgeLabel"] },
          {
            label: "Пункты списка",
            fields: ["features"],
          },
        ]}
        onAdd={onAdd}
        onSave={onSave}
        onDelete={onDelete}
      />
    </div>
  );
}
