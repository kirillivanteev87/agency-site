"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ButtonLabelKey } from "@/lib/button-labels";
import type { ContentHighlightField } from "@/lib/content-preview-apply";
import type { SiteSettingsField } from "@/lib/site-settings-fields";

const HIGHLIGHT_BY_FIELD: Partial<Record<SiteSettingsField, ContentHighlightField>> = {
  brandName: "brandName",
  brandHighlightText: "brandHighlightText",
  brandHighlightColor: "brandHighlightColor",
  heroTitle: "heroTitle",
  heroHighlight: "heroHighlight",
  heroSubtitle: "heroSubtitle",
  heroMeta: "heroMeta",
  statValue: "statValue",
  statText: "statText",
  footerCopyright: "footerCopyright",
  phones: "phones",
  emails: "emails",
  addresses: "addresses",
  socialLinks: "socialLinks",
};

export function useSitePreview(settings: Record<string, string> | null, enabled: boolean) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const timerRef = useRef<number | undefined>(undefined);

  const pushPreview = useCallback((payload: Record<string, string>) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "CONTENT_PREVIEW", settings: payload },
      window.location.origin,
    );
  }, []);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "CONTENT_PREVIEW_READY") setReady(true);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!enabled || !ready || !settings) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => pushPreview(settings), 160);
    return () => window.clearTimeout(timerRef.current);
  }, [enabled, ready, settings, pushPreview]);

  function highlightField(field: SiteSettingsField) {
    const target = HIGHLIGHT_BY_FIELD[field];
    if (!target || !ready) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: "CONTENT_PREVIEW_HIGHLIGHT", field: target },
      window.location.origin,
    );
  }

  const reloadPreview = useCallback(() => {
    setReady(false);
    setReloadKey((k) => k + 1);
  }, []);

  function highlightButton(key: ButtonLabelKey) {
    if (!ready) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: "CONTENT_PREVIEW_BUTTON_HIGHLIGHT", key },
      window.location.origin,
    );
  }

  return { iframeRef, ready, reloadKey, highlightField, highlightButton, reloadPreview };
}
