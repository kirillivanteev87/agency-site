"use client";

import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetchJson } from "@/lib/admin-fetch-json";
import { PROJECT_LANDING_DEFAULTS, getProjectCardTitle, getProjectPageTitle } from "@/lib/project-landing";
import { AdminSecondaryShell } from "../AdminSecondaryShell";
import { AdminToolPreview } from "../AdminToolPreview";
import { ProjectEditor, type ProjectEditorMode } from "../ProjectEditor";

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  return adminFetchJson<T>(url, init);
}

type Props = {
  mode: ProjectEditorMode;
};

const META: Record<
  ProjectEditorMode,
  { title: string; subtitle: string; previewTitle: string; previewSub: string; addLabel: string }
> = {
  card: {
    title: "Карточки проектов",
    subtitle: "Текст, обложка и порядок карточек в секции «Портфолио» на главной странице.",
    previewTitle: "Превью главной",
    previewSub: "Секция «Портфолио»",
    addLabel: "Проект",
  },
  page: {
    title: "Страницы проектов",
    subtitle: "Продающие страницы /projects/… — Hero, блоки, галерея, отзыв и CTA.",
    previewTitle: "Превью страницы",
    previewSub: "Открытая страница проекта",
    addLabel: "Страница",
  },
};

export function ProjectsContentEditor({ mode }: Props) {
  const router = useRouter();
  const meta = META[mode];
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
      const data = await api<Record<string, unknown>[]>("/api/admin/projects");
      setList(data);
      setSelectedId((prev) => {
        if (data.length === 0) return null;
        if (prev != null && data.some((row) => Number(row.id) === prev)) return prev;
        return Number(data[0].id);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось загрузить проекты");
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
      await api("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...PROJECT_LANDING_DEFAULTS,
          title: "Новый проект",
          description: "",
          cardTitle: "Новый проект",
          cardDescription: "",
          cardResultText: "",
          pageTitle: "Новый проект",
          pageDescription: "",
          body: "",
          gallery: "[]",
          imageUrl: "",
          link: "",
          sortOrder: list.length,
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
      await api(`/api/admin/projects/${id}`, {
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
    if (!confirm("Удалить проект?")) return;
    await api(`/api/admin/projects/${id}`, { method: "DELETE" });
    await load();
    router.refresh();
  }

  const selected = list.find((row) => Number(row.id) === selectedId) ?? null;
  const previewPath =
    mode === "card"
      ? "/?preview=content#projects"
      : selectedId != null
        ? `/projects/${selectedId}`
        : "/?preview=content#projects";

  return (
    <AdminSecondaryShell
      title={meta.title}
      subtitle={meta.subtitle}
      headerActions={
        <>
          {msg ? <span className="admin-status admin-status--ok">{msg}</span> : null}
          {error ? <span className="admin-status admin-status--err">{error}</span> : null}
        </>
      }
      preview={
        <AdminToolPreview
          title={meta.previewTitle}
          subtitle={meta.previewSub}
          src={previewPath}
          reloadKey={previewNonce}
          onReload={() => setPreviewNonce((n) => n + 1)}
        />
      }
    >
      <div className="admin-list-layout admin-list-layout--tall">
        <div className="admin-list-rail">
          <div className="admin-list-rail-head">
            <p className="admin-list-rail-title">Проекты</p>
            <button type="button" className="admin-btn-sm" onClick={() => void createItem()}>
              <Plus size={14} />
              {meta.addLabel}
            </button>
          </div>
          {loading ? (
            <p className="admin-list-empty">Загрузка…</p>
          ) : list.length === 0 ? (
            <p className="admin-list-empty">Пока нет проектов</p>
          ) : (
            <ul className="admin-list-items">
              {list.map((row) => {
                const id = Number(row.id);
                const active = id === selectedId;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className={`admin-list-chip ${active ? "admin-list-chip--active" : ""}`}
                      onClick={() => setSelectedId(id)}
                    >
                      <span className="admin-list-chip-title">
                        {mode === "card"
                          ? getProjectCardTitle({
                              cardTitle: String(row.cardTitle ?? ""),
                              title: String(row.title ?? ""),
                            })
                          : getProjectPageTitle({
                              pageTitle: String(row.pageTitle ?? ""),
                              title: String(row.title ?? ""),
                            })}
                      </span>
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
            <ProjectEditor
              key={`${mode}-${selectedId}`}
              mode={mode}
              item={selected}
              onSave={updateItem}
              onDelete={deleteItem}
              onUpload={uploadFile}
            />
          ) : (
            <div className="admin-card admin-card--placeholder">
              <p>Выберите проект слева или создайте новый.</p>
            </div>
          )}
        </div>
      </div>
    </AdminSecondaryShell>
  );
}
