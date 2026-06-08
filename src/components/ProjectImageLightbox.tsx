"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SiteImage } from "./SiteImage";
import type { DetailPhoto } from "@/lib/project-gallery";

const SWIPE_PX = 48;

type Props = {
  photos: DetailPhoto[];
  /** Индекс снимка, с которого открыли */
  startIndex: number;
  onClose: () => void;
  /** Синхронизация с превью снаружи при листании */
  onIndexChange?: (index: number) => void;
};

export function ProjectImageLightbox({ photos, startIndex, onClose, onIndexChange }: Props) {
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(() =>
    Math.min(Math.max(0, startIndex), Math.max(0, photos.length - 1)),
  );

  const touchStartX = useRef<number | null>(null);
  const thumbBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const clamped = Math.min(Math.max(0, startIndex), Math.max(0, photos.length - 1));
    setIndex(clamped);
  }, [startIndex, photos.length]);

  const goPrev = useCallback(() => {
    if (photos.length <= 1) return;
    setIndex((prev) => {
      const next = (prev - 1 + photos.length) % photos.length;
      onIndexChange?.(next);
      return next;
    });
  }, [photos.length, onIndexChange]);

  const goNext = useCallback(() => {
    if (photos.length <= 1) return;
    setIndex((prev) => {
      const next = (prev + 1) % photos.length;
      onIndexChange?.(next);
      return next;
    });
  }, [photos.length, onIndexChange]);

  useEffect(() => {
    if (!mounted || photos.length === 0) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [mounted, photos.length, onClose, goPrev, goNext]);

  useEffect(() => {
    thumbBtnRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [index]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null || photos.length <= 1) {
      touchStartX.current = null;
      return;
    }
    const endX = e.changedTouches[0].clientX;
    const dx = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < SWIPE_PX) return;
    if (dx > 0) goPrev();
    else goNext();
  }

  function selectThumb(i: number) {
    setIndex(i);
    onIndexChange?.(i);
  }

  if (!mounted || typeof document === "undefined" || photos.length === 0) return null;

  const photo = photos[index];
  const fullSrc = photo?.fullUrl;
  if (!fullSrc) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[280] bg-black/92"
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр изображения"
      onClick={onClose}
    >
      <div className="pointer-events-none flex h-full max-h-[100dvh] flex-col">
        <div
          className="pointer-events-auto flex shrink-0 justify-end p-3 md:p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] p-2.5 text-[var(--text)] shadow-lg transition-colors hover:border-[var(--accent)] hover:bg-[var(--bg-card-hover)]"
            aria-label="Закрыть"
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>

        <div className="pointer-events-none relative flex min-h-0 flex-1 items-center justify-center px-2 md:px-8">
          {photos.length > 1 && (
            <>
              <button
                type="button"
                className="pointer-events-auto absolute left-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)]/90 p-2 text-[var(--text)] backdrop-blur-sm transition-colors hover:border-[var(--accent)] sm:block md:left-3"
                aria-label="Предыдущее фото"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
              >
                <ChevronLeft size={26} />
              </button>
              <button
                type="button"
                className="pointer-events-auto absolute right-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)]/90 p-2 text-[var(--text)] backdrop-blur-sm transition-colors hover:border-[var(--accent)] sm:block md:right-3"
                aria-label="Следующее фото"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
              >
                <ChevronRight size={26} />
              </button>
            </>
          )}

          <div
            className="pointer-events-auto flex max-h-full max-w-[min(1200px,calc(100vw-1rem))] touch-pan-y items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fullSrc}
              alt=""
              draggable={false}
              className="max-h-[min(72vh,calc(100dvh-220px))] max-w-full select-none object-contain shadow-2xl"
            />
          </div>
        </div>

        {photos.length > 1 && (
          <div
            className="pointer-events-auto shrink-0 border-t border-[var(--border)]/60 bg-black/50 px-3 pb-3 pt-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex max-w-full snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth py-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--border)] [&::-webkit-scrollbar-track]:bg-transparent">
              {photos.map((thumb, i) => (
                <button
                  key={`${thumb.displayUrl}-${i}`}
                  type="button"
                  ref={(el) => {
                    thumbBtnRefs.current[i] = el;
                  }}
                  onClick={() => selectThumb(i)}
                  className={`relative h-16 w-24 shrink-0 snap-center overflow-hidden rounded-md border-2 bg-[var(--input-bg)] transition-all ${
                    i === index
                      ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/25"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`Миниатюра ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                >
                  <SiteImage src={thumb.displayUrl} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
              {index + 1} / {photos.length} · свайп по картинке
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
