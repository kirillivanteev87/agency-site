"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { ItemEditor, type AdminFieldGroup } from "./ItemEditor";

type Props = {
  items: Record<string, unknown>[];
  loading: boolean;
  emptyLabel: string;
  addLabel: string;
  getItemTitle: (item: Record<string, unknown>) => string;
  getItemMeta?: (item: Record<string, unknown>) => string;
  fields?: string[];
  fieldGroups?: AdminFieldGroup[];
  onAdd: () => void;
  onSave: (id: number, data: Record<string, unknown>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onUpload?: (file: File) => Promise<string>;
};

export function AdminListPanel({
  items,
  loading,
  emptyLabel,
  addLabel,
  getItemTitle,
  getItemMeta,
  fields,
  fieldGroups,
  onAdd,
  onSave,
  onDelete,
  onUpload,
}: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      setSelectedId(null);
      return;
    }
    if (selectedId == null || !items.some((i) => Number(i.id) === selectedId)) {
      setSelectedId(Number(items[0].id));
    }
  }, [items, selectedId]);

  const selected = items.find((i) => Number(i.id) === selectedId);

  return (
    <div className="admin-list-layout">
      <div className="admin-list-rail">
        <div className="admin-list-rail-head">
          <p className="admin-list-rail-title">Элементы</p>
          <button type="button" className="admin-btn-sm" onClick={() => void onAdd()}>
            <Plus size={14} />
            {addLabel}
          </button>
        </div>
        {loading ? (
          <p className="admin-list-empty">Загрузка…</p>
        ) : items.length === 0 ? (
          <p className="admin-list-empty">{emptyLabel}</p>
        ) : (
          <ul className="admin-list-items">
            {items.map((item) => {
              const id = Number(item.id);
              const active = id === selectedId;
              return (
                <li key={id}>
                  <button
                    type="button"
                    className={`admin-list-chip ${active ? "admin-list-chip--active" : ""}`}
                    onClick={() => setSelectedId(id)}
                  >
                    <span className="admin-list-chip-title">{getItemTitle(item)}</span>
                    {getItemMeta ? <span className="admin-list-chip-meta">{getItemMeta(item)}</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="admin-list-editor">
        {selected ? (
          <ItemEditor
            item={selected}
            fields={fields}
            fieldGroups={fieldGroups}
            onSave={onSave}
            onDelete={onDelete}
            onUpload={onUpload}
            flush
          />
        ) : (
          <div className="admin-card admin-card--placeholder">
            <p>Выберите элемент слева или добавьте новый</p>
          </div>
        )}
      </div>
    </div>
  );
}
