"use client";

import { type ReactNode } from "react";

/** Пауза между снятием вуали с соседних карточек (мс) */
const HERO_MOSAIC_REVEAL_STAGGER_MS = 260;

type Props = {
  children: ReactNode;
  className?: string;
  /** Управляется родителем: один триггер скролла на всю сетку */
  revealStarted: boolean;
  /** 0 = большая +28%, далее мелкие по очереди */
  revealStepIndex: number;
};

export function HeroMosaicSheen({ children, revealStarted, revealStepIndex, className = "" }: Props) {
  const delayMs = revealStepIndex * HERO_MOSAIC_REVEAL_STAGGER_MS;

  return (
    <div className={`relative min-h-0 overflow-hidden rounded-[var(--radius)] ${className}`.trim()}>
      {/* Один flex-потомок для селектора .hero-mosaic-main > div / .hero-mosaic-cell > div */}
      <div className="relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
        <div
          className={`hero-mosaic-sheen pointer-events-none absolute inset-0 z-20 rounded-[var(--radius)] ${revealStarted ? "hero-mosaic-sheen--exit" : ""}`}
          style={revealStarted ? { animationDelay: `${delayMs}ms` } : undefined}
          aria-hidden
        />
        <div className="relative z-0 flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
