"use client";

import { useEffect, useRef, useState } from "react";
import { ProjectImageLightbox } from "./ProjectImageLightbox";
import { SiteImage } from "./SiteImage";
import type { DetailPhoto } from "@/lib/project-gallery";

const MAIN_SWIPE_PX = 48;

export function DetailMediaGallery({
  photos,
  alt,
  resetKey,
}: {
  photos: DetailPhoto[];
  alt: string;
  /** При смене сущности сбрасываем активный кадр */
  resetKey?: string | number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const thumbBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mainTouchStartX = useRef<number | null>(null);
  const suppressMainClickRef = useRef(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [resetKey]);

  const safeActive = photos.length === 0 ? 0 : Math.min(activeIndex, photos.length - 1);
  const mainSrc = photos[safeActive]?.displayUrl ?? "";

  useEffect(() => {
    thumbBtnRefs.current[safeActive]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [safeActive, photos.length]);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--input-bg)] text-sm text-[var(--text-muted)]">
        Нет изображений
      </div>
    );
  }

  return (
    <div className="space-y-3 lg:sticky lg:top-0 lg:self-start">
      <button
        type="button"
        className="group relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--input-bg)] text-left shadow-lg transition-shadow hover:border-[var(--accent)]/40 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        aria-label="Открыть просмотр изображения. Свайп влево-вправо — другой кадр."
        onClick={() => {
          if (suppressMainClickRef.current) {
            suppressMainClickRef.current = false;
            return;
          }
          setLightboxIndex(safeActive);
        }}
        onTouchStart={(e) => {
          mainTouchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (mainTouchStartX.current == null || photos.length <= 1) {
            mainTouchStartX.current = null;
            return;
          }
          const dx = e.changedTouches[0].clientX - mainTouchStartX.current;
          mainTouchStartX.current = null;
          if (Math.abs(dx) < MAIN_SWIPE_PX) return;
          suppressMainClickRef.current = true;
          window.setTimeout(() => {
            suppressMainClickRef.current = false;
          }, 350);
          const n = photos.length;
          setActiveIndex((prev) => {
            const cur = Math.min(prev, n - 1);
            if (dx > 0) return (cur - 1 + n) % n;
            return (cur + 1) % n;
          });
        }}
      >
        <SiteImage src={mainSrc} alt={alt} fill className="object-cover" />
        <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
      </button>

      {photos.length > 1 && (
        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--border)] [&::-webkit-scrollbar-track]:bg-transparent">
          {photos.map((photo, i) => (
            <button
              key={`${photo.displayUrl}-${i}`}
              type="button"
              ref={(el) => {
                thumbBtnRefs.current[i] = el;
              }}
              onClick={() => {
                setActiveIndex(i);
                setLightboxIndex(i);
              }}
              className={`relative h-20 w-28 shrink-0 snap-center overflow-hidden rounded-[var(--radius)] border-2 bg-[var(--input-bg)] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                i === safeActive
                  ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/30"
                  : "border-[var(--border)] opacity-80 hover:border-[var(--text-muted)] hover:opacity-100"
              }`}
              aria-label={`Фото ${i + 1}, открыть просмотр`}
            >
              <SiteImage src={photo.displayUrl} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <ProjectImageLightbox
          photos={photos}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setActiveIndex}
        />
      )}
    </div>
  );
}
