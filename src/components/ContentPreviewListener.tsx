"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  applyContentPreview,
  flashButtonHighlight,
  flashContentHighlight,
  type ContentHighlightField,
} from "@/lib/content-preview-apply";
import type { ButtonLabelKey } from "@/lib/button-labels";

const HIGHLIGHT_KEYS = new Set<string>([
  "brandName",
  "brandHighlightText",
  "brandHighlightColor",
  "heroTitle",
  "heroHighlight",
  "heroSubtitle",
  "heroMeta",
  "statValue",
  "statText",
  "footerCopyright",
  "phones",
  "emails",
  "addresses",
  "socialLinks",
]);

export function ContentPreviewListener() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const isPreview = mounted && searchParams.get("preview") === "content";

  useEffect(() => {
    if (!isPreview) return;

    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;

      const data = event.data as {
        type?: string;
        settings?: Record<string, unknown>;
        field?: ContentHighlightField;
        key?: string;
      };

      if (data?.type === "CONTENT_PREVIEW" && data.settings && typeof data.settings === "object") {
        applyContentPreview(data.settings);
      }
      if (
        data?.type === "CONTENT_PREVIEW_HIGHLIGHT" &&
        typeof data.field === "string" &&
        HIGHLIGHT_KEYS.has(data.field)
      ) {
        flashContentHighlight(data.field as ContentHighlightField);
      }
      if (data?.type === "CONTENT_PREVIEW_BUTTON_HIGHLIGHT" && typeof data.key === "string") {
        flashButtonHighlight(data.key as ButtonLabelKey);
      }
    }

    window.addEventListener("message", onMessage);
    window.parent?.postMessage({ type: "CONTENT_PREVIEW_READY" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, [isPreview]);

  return null;
}
