"use client";

import type { RefObject } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import {
  ADMIN_PREVIEW_LABELS,
  ADMIN_PREVIEW_PATHS,
  type AdminDashboardTab,
} from "@/lib/admin-preview-paths";

type Props = {
  tab: AdminDashboardTab;
  previewSrc: string;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  ready: boolean;
  reloadKey: number;
  onReload: () => void;
  hidden?: boolean;
};

export function AdminSitePreview({ tab, previewSrc, iframeRef, ready, reloadKey, onReload, hidden }: Props) {
  if (hidden) return null;

  return (
    <aside className="admin-preview" aria-label="Превью сайта">
      <div className="admin-preview-toolbar">
        <div className="min-w-0">
          <p className="admin-preview-title">Превью сайта</p>
          <p className="admin-preview-sub">{ADMIN_PREVIEW_LABELS[tab]}</p>
        </div>
        <div className="admin-preview-actions">
          <button type="button" className="admin-icon-btn" onClick={onReload} title="Обновить превью">
            <RefreshCw size={16} />
          </button>
          <a
            href={ADMIN_PREVIEW_PATHS[tab]}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-icon-btn"
            title="Открыть в новой вкладке"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
      <div className="admin-preview-frame-wrap">
        {!ready ? (
          <div className="admin-preview-loading">
            <span className="admin-preview-spinner" aria-hidden />
            Загрузка…
          </div>
        ) : null}
        <iframe
          key={`${previewSrc}-${reloadKey}`}
          ref={iframeRef}
          title="Превью сайта"
          src={previewSrc}
          className="admin-preview-iframe"
        />
      </div>
    </aside>
  );
}
