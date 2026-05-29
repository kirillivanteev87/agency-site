"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId, type CSSProperties } from "react";
import { SiteImage } from "./SiteImage";
import { HeroMosaicCornerGlow } from "./HeroMosaicCornerGlow";
import { useSkipEntranceMotion } from "@/lib/skip-entrance-motion";

type Props = {
  imageUrl?: string | null;
};

const BAR_HEIGHTS = [32, 44, 38, 56, 72, 88] as const;

function GrowthChart({ uid }: { uid: string }) {
  const lineId = `${uid}-line`;
  const fillId = `${uid}-fill`;
  return (
    <svg viewBox="0 0 128 52" className="h-11 w-full" aria-hidden>
      <defs>
        <linearGradient id={lineId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(251, 113, 133, 0.45)" />
          <stop offset="100%" stopColor="rgba(244, 63, 94, 0.95)" />
        </linearGradient>
        <linearGradient id={fillId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(225, 29, 72, 0.28)" />
          <stop offset="100%" stopColor="rgba(225, 29, 72, 0)" />
        </linearGradient>
      </defs>
      <path
        d="M6 40 L28 34 L48 28 L68 20 L88 14 L108 8 L122 6"
        fill="none"
        stroke={`url(#${lineId})`}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 40 L28 34 L48 28 L68 20 L88 14 L108 8 L122 6 L122 46 L6 46 Z"
        fill={`url(#${fillId})`}
      />
    </svg>
  );
}

function ConversionHeroGraphic({
  uid,
  reduceMotion,
  skipEntrance,
}: {
  uid: string;
  reduceMotion: boolean | null;
  skipEntrance: boolean;
}) {
  const hideEntrance = reduceMotion || skipEntrance;
  const ringGradId = `${uid}-ring-grad`;
  const glowId = `${uid}-glow`;

  const arcLength = 251;
  const arcProgress = arcLength * 0.72;

  return (
    <div className="hero-highlight-visual" aria-hidden>
      <motion.div
        className="hero-highlight-visual-motion"
        initial={hideEntrance ? false : { opacity: 0, scale: 0.9, y: 18 }}
        whileInView={hideEntrance ? undefined : { opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ delay: 0.12, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
      <div className="hero-highlight-visual-bars">
        {BAR_HEIGHTS.map((height, index) => (
          <motion.span
            key={index}
            className="hero-highlight-visual-bar"
            style={
              {
                "--bar-h": `${height}%`,
                "--bar-delay": `${index * 0.08}s`,
              } as CSSProperties
            }
            initial={hideEntrance ? false : { scaleY: 0.4, opacity: 0 }}
            whileInView={hideEntrance ? undefined : { scaleY: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.25 + index * 0.06,
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <span className="hero-highlight-visual-bar-fill" />
          </motion.span>
        ))}
      </div>

      <svg className="hero-highlight-visual-ring" viewBox="0 0 220 220" aria-hidden>
        <defs>
          <linearGradient id={ringGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="55%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>
          <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx="110"
          cy="110"
          r="88"
          fill="none"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${arcLength}`}
          strokeDashoffset={arcLength * 0.22}
          transform="rotate(128 110 110)"
        />

        <motion.circle
          cx="110"
          cy="110"
          r="88"
          fill="none"
          stroke={`url(#${ringGradId})`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${arcProgress} ${arcLength}`}
          strokeDashoffset={arcLength * 0.22}
          transform="rotate(128 110 110)"
          filter={`url(#${glowId})`}
          initial={hideEntrance ? false : { strokeDasharray: `0 ${arcLength}` }}
          whileInView={
            hideEntrance ? undefined : { strokeDasharray: `${arcProgress} ${arcLength}` }
          }
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />

        <circle cx="110" cy="110" r="62" fill="rgba(255, 255, 255, 0.025)" />
        <circle
          cx="110"
          cy="110"
          r="62"
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1"
        />
      </svg>

      <div className="hero-highlight-visual-stat">
        <span className="hero-highlight-visual-plus">+</span>
        <span className="hero-highlight-visual-value">28</span>
        <span className="hero-highlight-visual-pct">%</span>
      </div>

      <motion.div
        className="hero-highlight-visual-chip hero-highlight-visual-chip--days"
        initial={hideEntrance ? false : { opacity: 0, y: 8 }}
        whileInView={hideEntrance ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.78, duration: 0.5 }}
      >
        90 дней
      </motion.div>

      <div className="hero-highlight-visual-glow" aria-hidden />
      </motion.div>
    </div>
  );
}

export function HeroHighlightBlock({ imageUrl }: Props) {
  const reduceMotion = useReducedMotion();
  const skipEntrance = useSkipEntranceMotion();
  const hideEntrance = reduceMotion || skipEntrance;
  const chartUid = useId();
  const graphicUid = useId();

  const floatTransition = reduceMotion
    ? undefined
    : { duration: 9, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <motion.div
      className="hero-highlight group relative h-full min-h-[220px] overflow-hidden rounded-[var(--radius)]"
      whileHover={reduceMotion ? undefined : { scale: 1.01 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div className="hero-highlight-gradient" aria-hidden />
      <HeroMosaicCornerGlow variant="highlight" className="z-[1]" />
      <motion.div className="hero-highlight-noise" aria-hidden />

      <motion.div
        className="hero-highlight-orb hero-highlight-orb--1"
        aria-hidden
        animate={reduceMotion ? undefined : { y: [0, -14, 0], x: [0, 8, 0] }}
        transition={floatTransition}
      />
      <motion.div
        className="hero-highlight-orb hero-highlight-orb--2"
        aria-hidden
        animate={reduceMotion ? undefined : { y: [0, 10, 0], x: [0, -6, 0] }}
        transition={floatTransition ? { ...floatTransition, duration: 11 } : undefined}
      />
      <motion.div
        className="hero-highlight-orb hero-highlight-orb--3"
        aria-hidden
        animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
        transition={floatTransition ? { ...floatTransition, duration: 13 } : undefined}
      />

      <motion.div className="hero-highlight-glow" aria-hidden />

      {imageUrl ? (
        <SiteImage
          src={imageUrl}
          alt=""
          fill
          className="hero-highlight-photo object-cover opacity-[0.14] mix-blend-luminosity"
        />
      ) : null}

      <ConversionHeroGraphic uid={graphicUid} reduceMotion={reduceMotion} skipEntrance={skipEntrance} />

      <motion.div
        className="hero-highlight-glass"
        initial={hideEntrance ? false : { opacity: 0, y: 16, scale: 0.96 }}
        whileInView={hideEntrance ? undefined : { opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        animate={hideEntrance ? undefined : { y: [0, -6, 0] }}
        {...(hideEntrance
          ? {}
          : {
              transition: {
                delay: 0.35,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
                y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.05 },
              },
            })}
      >
        <div className="hero-highlight-glass-shine" aria-hidden />
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/50">Рост конверсии</p>
        <GrowthChart uid={chartUid} />
        <p className="mt-1 text-xs font-semibold text-white/85">+28% за 90 дней</p>
      </motion.div>

      <div className="hero-highlight-copy">
        <p className="text-sm text-white/65">Средний рост конверсии клиентов</p>
        <p className="hero-highlight-stat mt-1">+28% после редизайна</p>
      </div>
    </motion.div>
  );
}
