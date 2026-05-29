"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  children: React.ReactNode;
  onDismiss?: () => void;
  /** Заголовок в шапке оверлея */
  overlayTitle?: string;
};

export function ProjectModalShell({ children, onDismiss, overlayTitle = "Проект" }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const dismiss = useCallback(() => {
    if (onDismiss) {
      onDismiss();
      return;
    }
    router.back();
  }, [onDismiss, router]);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [mounted, dismiss]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-3"
      role="dialog"
      aria-modal="true"
      aria-label={overlayTitle}
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-4 py-3 md:px-6">
          <p className="text-sm text-[var(--text-muted)]">{overlayTitle}</p>
          <button
            type="button"
            className="rounded-[var(--radius)] p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-white"
            aria-label="Закрыть"
            onClick={dismiss}
          >
            <X size={22} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-4 md:px-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
