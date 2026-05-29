"use client";

import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetchJson } from "@/lib/admin-fetch-json";
import { CASE_LANDING_DEFAULTS } from "@/lib/case-study-landing";
import { AdminSecondaryShell } from "../AdminSecondaryShell";
import { AdminToolPreview } from "../AdminToolPreview";
import { CaseStudyEditor } from "../CaseStudyEditor";

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  return adminFetchJson<T>(url, init);
}

export function CasesContentEditor() {
  const router = useRouter();
  const [list, setList] = useState<Record<string, unknown>[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [previewNonce, setPreviewNonce] = useState(0);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setMsg("");
    setError("");
    try {
      const data = await api<Record<string, unknown>[]>("/api/admin/case-studies");
      setList(data);
      setSelectedId((prev) => {
        if (data.length === 0) return null;
        if (prev != null && data.some((row) => Number(row.id) === prev)) return prev;
        return Number(data[0].id);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось загрузить кейсы");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function uploadFile(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("category", "image");
    const res = await api<{ url: string }>("/api/upload", { method: "POST", body: fd });
    return res.url;
  }

  async function createItem() {
    setError("");
    try {
      await api("/api/admin/case-studies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tag: "Кейс",
          title: "Новый кейс",
          description: "",
          body: "",
          gallery: "[]",
          imageUrl: "",
          link: "",
          sortOrder: list.length,
          ...CASE_LANDING_DEFAULTS,
        }),
      });
      await load();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось создать");
    }
  }

  async function updateItem(id: number, data: Record<string, unknown>) {
    setError("");
    try {
      await api(`/api/admin/case-studies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await load();
      setMsg("Сохранено");
      setPreviewNonce((n) => n + 1);
      router.refresh();
    } catch (e) {
      setMsg("");
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    }
  }

  async function deleteItem(id: number) {
    if (!confirm("Удалить кейс?")) return;
    await api(`/api/admin/case-studies/${id}`, { method: "DELETE" });
    await load();
    router.refresh();
  }

  const selected = list.find((row) => Number(row.id) === selectedId) ?? null;
  const previewPath = selectedId != null ? `/cases/${selectedId}` : "/?preview=content#cases";

  return (
    <AdminSecondaryShell
      title="Страницы кейсов"
      subtitle="Продающие страницы /cases/… — все блоки, галерея, отзыв и CTA."
      headerActions={
        <>
          {msg ? <span className="admin-status admin-status--ok">{msg}</span> : null}
          {error ? <span className="admin-status admin-status--err">{error}</span> : null}
        </>
      }
      preview={
        <AdminToolPreview
          title="Превью страницы"
          subtitle="Открытая страница кейса"
          src={previewPath}
          reloadKey={previewNonce}
          onReload={() => setPreviewNonce((n) => n + 1)}
        />
      }
    >
      <div className="admin-list-layout admin-list-layout--tall">
        <div className="admin-list-rail">
          <div className="admin-list-rail-head">
            <p className="admin-list-rail-title">Кейсы</p>
            <button type="button" className="admin-btn-sm" onClick={() => void createItem()}>
              <Plus size={14} />
              Кейс
            </button>
          </div>
          {loading ? (
            <p className="admin-list-empty">Загрузка…</p>
          ) : list.length === 0 ? (
            <p className="admin-list-empty">Пока нет кейсов</p>
          ) : (
            <ul className="admin-list-items">
              {list.map((row) => {
                const id = Number(row.id);
                const active = id === selectedId;
                const label = [row.tag, row.title].filter(Boolean).join(" — ") || `Кейс ${id}`;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className={`admin-list-chip ${active ? "admin-list-chip--active" : ""}`}
                      onClick={() => setSelectedId(id)}
                    >
                      <span className="admin-list-chip-title">{label}</span>
                      <span className="admin-list-chip-meta">#{id}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="admin-list-editor">
          {selected ? (
            <CaseStudyEditor
              key={`case-${selectedId}`}
              item={selected}
              onSave={updateItem}
              onDelete={deleteItem}
              onUpload={uploadFile}
            />
          ) : (
            <div className="admin-card admin-card--placeholder">
              <p>Выберите кейс слева или создайте новый.</p>
            </div>
          )}
        </div>
      </div>
    </AdminSecondaryShell>
  );
}
