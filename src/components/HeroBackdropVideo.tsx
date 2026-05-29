"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  className?: string;
  /**
   * Скорость воспроизведения. Сильно ниже ~0.5 браузеры часто показывают с рывками;
   * для «очень медленно» надёжнее перекодировать ролик offline и оставить rate ≈ 1.
   */
  playbackRate?: number;
};

/** Фоновое зацикленное видео; при prefers-reduced-motion не воспроизводится */
export function HeroBackdropVideo({ src, className = "", playbackRate = 0.5 }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.load();
  }, [src]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const applyRate = () => {
      if (!mq.matches) {
        el.playbackRate = playbackRate;
      }
    };

    function sync() {
      if (!el) return;
      if (mq.matches) {
        el.pause();
        el.removeAttribute("autoplay");
      } else {
        el.muted = true;
        applyRate();
        void el.play().catch(() => {});
      }
    }

    el.addEventListener("loadeddata", applyRate);
    el.addEventListener("canplay", applyRate);

    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      el.removeEventListener("loadeddata", applyRate);
      el.removeEventListener("canplay", applyRate);
    };
  }, [src, playbackRate]);

  return (
    <video
      ref={videoRef}
      className={className}
      style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
      src={src}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      disablePictureInPicture
      aria-hidden
      tabIndex={-1}
    />
  );
}
