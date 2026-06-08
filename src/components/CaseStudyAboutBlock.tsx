"use client";

import { useEffect, useState } from "react";
import { ProjectImageLightbox } from "./ProjectImageLightbox";
import { Reveal } from "./Reveal";
import { SiteImage } from "./SiteImage";
import type { DetailPhoto } from "@/lib/project-gallery";

export function CaseStudyAboutBlock({
  photos,
  alt,
  body,
  resetKey,
  galleryLabel = "Галерея проекта",
}: {
  photos: DetailPhoto[];
  alt: string;
  body: string;
  resetKey?: string | number;
  galleryLabel?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [resetKey]);

  const safeActive = photos.length === 0 ? 0 : Math.min(activeIndex, photos.length - 1);
  const activePhoto = photos[safeActive];
  const mainSrc = activePhoto?.displayUrl ?? "";
  const hasGallery = photos.length > 1;
  const hasMainImage = photos.length > 0;

  return (
    <Reveal delay={40}>
      <div className={`case-landing__about-card ${!hasMainImage ? "case-landing__about-card--text-only" : ""}`}>
        {hasMainImage ? (
          <div className="case-landing__about-media">
            <button
              type="button"
              className="case-landing__about-main group"
              aria-label="Открыть изображение в полном размере"
              onClick={() => setLightboxIndex(safeActive)}
            >
              <SiteImage src={mainSrc} alt={alt} fill className="object-cover transition-opacity duration-300" />
              <span className="case-landing__about-main-hover" aria-hidden />
            </button>

            {hasGallery ? (
              <div className="case-landing__about-thumbs-wrap">
                <p className="case-landing__about-thumbs-label">{galleryLabel}</p>
                <ul className="case-landing__about-thumbs" aria-label="Дополнительные фото">
                  {photos.map((photo, index) => (
                    <li key={`${photo.displayUrl}-${index}`}>
                      <button
                        type="button"
                        className={`case-landing__about-thumb ${index === safeActive ? "case-landing__about-thumb--active" : ""}`}
                        aria-label={`Фото ${index + 1}${index === safeActive ? ", выбрано" : ""}`}
                        aria-pressed={index === safeActive}
                        onClick={() => setActiveIndex(index)}
                      >
                        <SiteImage src={photo.displayUrl} alt="" fill className="object-cover" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="case-landing__about-content">
          <div className="case-landing__story-text whitespace-pre-wrap">{body}</div>
        </div>
      </div>

      {lightboxIndex !== null && photos.length > 0 && (
        <ProjectImageLightbox
          photos={photos}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setActiveIndex}
        />
      )}
    </Reveal>
  );
}
