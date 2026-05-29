"use client";

import { ExternalLink, RefreshCw } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  src: string;
  reloadKey: number;
  onReload: () => void;
};

export function AdminToolPreview({ title, subtitle, src, reloadKey, onReload }: Props) {
  return (
    <aside className="admin-preview" aria-label="Предпросмотр">
      <div className="admin-preview-toolbar">
        <div className="min-w-0">
          <p className="admin-preview-title">{title}</p>
          {subtitle ? <p className="admin-preview-sub">{subtitle}</p> : null}
        </div>
        <div className="admin-preview-actions">
          <button type="button" className="admin-icon-btn" onClick={onReload} title="Обновить превью">
            <RefreshCw size={16} />
          </button>
          <a href={src} target="_blank" rel="noopener noreferrer" className="admin-icon-btn" title="Открыть в новой вкладке">
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
      <div className="admin-preview-frame-wrap">
        <iframe key={reloadKey} title={title} src={src} className="admin-preview-iframe" />
      </div>
    </aside>
  );
}
