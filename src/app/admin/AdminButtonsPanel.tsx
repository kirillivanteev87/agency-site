"use client";

import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import {
  BUTTON_LABEL_GROUPS,
  DEFAULT_BUTTON_LABELS,
  type ButtonLabelKey,
  type ButtonLabels,
} from "@/lib/button-labels";

type Props = {
  labels: ButtonLabels;
  /** Меняется только при загрузке с сервера или после сохранения — не при каждом вводе */
  syncKey: number;
  onChange: (next: ButtonLabels) => void;
  onHighlight?: (key: ButtonLabelKey) => void;
  onSave: (labels: ButtonLabels) => void;
  saving?: boolean;
};

export function AdminButtonsPanel({ labels, syncKey, onChange, onHighlight, onSave, saving }: Props) {
  const [draft, setDraft] = useState<ButtonLabels>(labels);

  useEffect(() => {
    setDraft(labels);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- labels подтягиваем только при syncKey (загрузка / сохранение)
  }, [syncKey]);

  function update(key: ButtonLabelKey, value: string) {
    const next = { ...draft, [key]: value };
    setDraft(next);
    onChange(next);
  }

  function resetDefaults() {
    const next = { ...DEFAULT_BUTTON_LABELS };
    setDraft(next);
    onChange(next);
  }

  return (
    <div className="admin-panel-stack">
      <section className="admin-card">
        <div className="admin-card-head">
          <h2 className="admin-card-title">Тексты на кнопках</h2>
          <p className="admin-card-desc">
            Подписи на всех основных CTA сайта: шапка, Hero, секции, формы, Marketplace и модалки.
          </p>
        </div>
        <div className="admin-card-body">
          <button type="button" className="btn-outline text-sm" onClick={resetDefaults}>
            Сбросить к значениям по умолчанию
          </button>
        </div>
      </section>

      {BUTTON_LABEL_GROUPS.map((group) => (
        <section key={group.title} className="admin-card">
          <div className="admin-card-head">
            <h2 className="admin-card-title">{group.title}</h2>
            {group.description ? <p className="admin-card-desc">{group.description}</p> : null}
          </div>
          <div className="admin-card-body admin-field-grid">
            {group.keys.map(({ key, label, hint }) => (
              <label key={key} className="admin-field">
                <span className="admin-field-label-row">
                  <span className="admin-field-label">{label}</span>
                  {onHighlight ? (
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
                {hint ? <span className="mb-1 block text-[10px] text-[var(--text-muted)]">{hint}</span> : null}
                <input
                  value={draft[key]}
                  onChange={(e) => update(key, e.target.value)}
                  onFocus={() => onHighlight?.(key)}
                  data-button-field={key}
                />
              </label>
            ))}
          </div>
        </section>
      ))}

      <div className="admin-sticky-save">
        <button type="button" className="btn-primary" disabled={saving} onClick={() => onSave(draft)}>
          {saving ? "Сохранение…" : "Сохранить тексты кнопок"}
        </button>
      </div>
    </div>
  );
}
