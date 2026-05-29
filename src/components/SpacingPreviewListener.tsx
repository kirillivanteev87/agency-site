"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { applySpacingToDocument, type SpacingConfig } from "@/lib/section-spacing";

export function SpacingPreviewListener() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPreview = mounted && searchParams.get("preview") === "spacing";

  useEffect(() => {
    if (!isPreview) return;

    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as {
        type?: string;
        spacing?: SpacingConfig;
        highlight?: string;
      };
      if (data?.type === "SPACING_PREVIEW" && data.spacing) {
        applySpacingToDocument(data.spacing);
        document.querySelectorAll("[data-section]").forEach((el) => {
          el.classList.remove("section-highlight");
        });
        if (data.highlight) {
          const el = document.querySelector(`[data-section="${data.highlight}"]`);
          el?.classList.add("section-highlight");
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }

    window.addEventListener("message", onMessage);
    window.parent?.postMessage({ type: "SPACING_PREVIEW_READY" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, [isPreview]);

  return null;
}
