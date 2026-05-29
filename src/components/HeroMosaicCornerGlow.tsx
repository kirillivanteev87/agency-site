"use client";

import { useReducedMotion } from "framer-motion";
import { useSkipEntranceMotion } from "@/lib/skip-entrance-motion";

type HeroMosaicCornerGlowProps = {
  className?: string;
  variant?: "cell" | "highlight" | "process";
};

export function HeroMosaicCornerGlow({ className = "", variant = "cell" }: HeroMosaicCornerGlowProps) {
  const reduceMotion = useReducedMotion();
  const skipEntrance = useSkipEntranceMotion();
  const animateIn = !reduceMotion && !skipEntrance;

  return (
    <div
      className={`hero-mosaic-corner-glow hero-mosaic-corner-glow--${variant}${animateIn ? " hero-mosaic-corner-glow--enter" : ""} pointer-events-none absolute inset-0 z-0 ${className}`.trim()}
      aria-hidden
      style={{ transformOrigin: "100% 100%" }}
    />
  );
}
