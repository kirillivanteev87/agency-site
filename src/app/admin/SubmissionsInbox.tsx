"use client";

import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminFetchJson } from "@/lib/admin-fetch-json";
import {
  isAiChatSubmission,
  parseAiChatTranscript,
  type ChatTurn,
} from "@/lib/parse-ai-chat-transcript";

export type SubmissionRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  read: boolean;
};

type Props = {
  items: SubmissionRow[];
  onRefresh: () => void | Promise<void>;
  onUnreadRefresh?: () => void | Promise<void>;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function ChatThread({ turns }: { turns: ChatTurn[] }) {
  if (turns.length === 0) {
    return <p className="text-sm text-[var(--text-muted)]">Диалог пуст или не удалось разобрать.</p>;
  }

  return (
    <div className="admin-chat-thread">
      {turns.map((turn, index) => (
        <div
          key={`${index}-${turn.role}`}
          className={`admin-chat-bubble admin-chat-bubble--${turn.role}`}
        >
          <p className="admin-chat-bubble-label">{turn.role === "client" ? "Клиент" : "Менеджер"}</p>
          <p className="admin-chat-bubble-text">{turn.content}</p>
        </div>
      ))}
    </div>
  );
}

export function SubmissionsInbox({ items, onRefresh, onUnreadRefresh }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(items[0]?.id ?? null);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(() => new Set());
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const selectedTurns = useMemo(
    () => (selected && isAiChatSubmission(selected.message) ? parseAiChatTranscript(selected.message) : []),
    [selected],
  );

  const allChecked = items.length > 0 && checkedIds.size === items.length;
  const someChecked = checkedIds.size > 0;

  useEffect(() => {
    setCheckedIds((prev) => {
      const ids = new Set(items.map((i) => i.id));
      const next = new Set<number>();
      for (const id of prev) {
        if (ids.has(id)) next.add(id);
      }
      return next;
    });
    if (items.length === 0) {
      setSelectedId(null);
      return;
    }
    if (selectedId === null || !items.some((i) => i.id === selectedId)) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

  const toggleOne = useCallback((id: number) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setCheckedIds((prev) => {
      if (items.length > 0 && prev.size === items.length) return new Set();
      return new Set(items.map((i) => i.id));
    });
  }, [items]);

  const deleteByIds = useCallback(
    async (ids: number[]) => {
      if (ids.length === 0) return;
      const label =
        ids.length === 1
          ? "Удалить эту заявку? Действие нельзя отменить."
          : `Удалить выбранные заявки (${ids.length})? Действие нельзя отменить.`;
      if (!confirm(label)) return;

      setDeleting(true);
      setError("");
      try {
        if (ids.length === 1) {
          await adminFetchJson(`/api/admin/submissions/${ids[0]}`, { method: "DELETE" });
        } else {
          await adminFetchJson("/api/admin/submissions/bulk-delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }),
          });
        }
        setCheckedIds((prev) => {
          const next = new Set(prev);
          for (const id of ids) next.delete(id);
          return next;
        });
        await onRefresh();
        await onUnreadRefresh?.();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Не удалось удалить");
      } finally {
        setDeleting(false);
      }
    },
    [onRefresh, onUnreadRefresh],
  );

  if (items.length === 0) {
    return <p className="card-surface p-6 text-sm text-[var(--text-muted)]">Заявок пока нет.</p>;
  }

  return (
    <div className="admin-inbox">
      {error ? <p className="mb-2 text-sm text-red-400">{error}</p> : null}

      <div className="admin-inbox-list card-surface">
        <div className="admin-inbox-toolbar">
          <label className="admin-inbox-check-all">
            <input
              type="checkbox"
              checked={allChecked}
              ref={(el) => {
                if (el) el.indeterminate = someChecked && !allChecked;
              }}
              onChange={toggleAll}
              disabled={deleting}
            />
            <span>Выбрать все</span>
          </label>
          {someChecked ? (
            <button
              type="button"
              className="admin-inbox-delete-btn"
              disabled={deleting}
              onClick={() => void deleteByIds([...checkedIds])}
            >
              <Trash2 size={14} aria-hidden />
              Удалить ({checkedIds.size})
            </button>
          ) : null}
        </div>

        <ul className="admin-inbox-items">
          {items.map((row) => {
            const isAi = isAiChatSubmission(row.message);
            const active = row.id === selectedId;
            const checked = checkedIds.has(row.id);
            return (
              <li key={row.id} className={`admin-inbox-li ${checked ? "admin-inbox-li--checked" : ""}`}>
                <input
                  type="checkbox"
                  className="admin-inbox-checkbox"
                  checked={checked}
                  disabled={deleting}
                  onChange={() => toggleOne(row.id)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Выбрать заявку ${row.name}`}
                />
                <button
                  type="button"
                  className={`admin-inbox-item ${active ? "admin-inbox-item--active" : ""} ${
                    row.read === false ? "admin-inbox-item--unread" : ""
                  }`}
                  onClick={() => setSelectedId(row.id)}
                >
                  <span className="admin-inbox-item-date">{formatDate(row.createdAt)}</span>
                  <span className="admin-inbox-item-row">
                    <span className="admin-inbox-item-name">{row.name}</span>
                    {isAi ? <span className="admin-ai-badge">AI Chat</span> : null}
                  </span>
                  <span className="admin-inbox-item-phone">{row.phone?.trim() || "—"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="admin-inbox-detail card-surface">
        {selected ? (
          <>
            <header className="admin-inbox-detail-header">
              <div>
                <p className="admin-inbox-detail-name">
                  {selected.name}
                  {isAiChatSubmission(selected.message) ? (
                    <span className="admin-ai-badge admin-ai-badge--inline">AI Chat</span>
                  ) : null}
                </p>
                <p className="text-sm text-[var(--text-muted)]">{formatDate(selected.createdAt)}</p>
              </div>
              <div className="admin-inbox-detail-actions">
                <div className="admin-inbox-detail-contacts text-sm">
                  <p>
                    <span className="text-[var(--text-muted)]">Телефон: </span>
                    {selected.phone?.trim() || "—"}
                  </p>
                  <p>
                    <span className="text-[var(--text-muted)]">Email: </span>
                    {selected.email?.trim() && selected.email !== "—" ? selected.email : "—"}
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-inbox-delete-btn admin-inbox-delete-btn--solo"
                  disabled={deleting}
                  onClick={() => void deleteByIds([selected.id])}
                >
                  <Trash2 size={16} aria-hidden />
                  Удалить заявку
                </button>
              </div>
            </header>

            <div className="admin-inbox-detail-body">
              {isAiChatSubmission(selected.message) ? (
                <ChatThread turns={selectedTurns} />
              ) : (
                <div className="admin-inbox-plain">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    Сообщение
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{selected.message}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="p-6 text-sm text-[var(--text-muted)]">Выберите заявку слева</p>
        )}
      </div>
    </div>
  );
}
