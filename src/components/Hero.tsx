"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Dashboard } from "./Dashboard";
import { DynamicIcon } from "./icons";
import { HeroBackdropVideo } from "./HeroBackdropVideo";
import { Reveal } from "./Reveal";
import type { SiteContent } from "./types";

const HERO_BENEFITS = [
  "Рост заявок и продаж",
  "Сроки и бюджет в договоре",
  "Поддержка после запуска",
] as const;

export function Hero({
  settings,
  heroFeatures,
  headerOverlay = false,
}: Pick<SiteContent, "settings" | "heroFeatures"> & { headerOverlay?: boolean }) {
  const main = heroFeatures.find((f) => f.variant === "image") || heroFeatures[4];
  const mosaicSideTitles = new Set(["UI/UX", "Разработка", "Брендинг", "SEO"]);
  const miniFeatures = heroFeatures.filter(
    (f) => f.id !== main?.id && !mosaicSideTitles.has(f.title),
  );

  const heroVideoDark = settings.heroVideoUrl?.trim() ?? "";
  const heroVideoLight = settings.heroVideoUrlLight?.trim() ?? "";
  const hasHeroVideo = heroVideoDark.length > 0 || heroVideoLight.length > 0;

  return (
    <div>
      <div
        className={`hero-screen relative isolate mb-12 ${
          hasHeroVideo ? "hero-screen--video overflow-hidden" : "hero-screen--static overflow-hidden"
        }`}
      >
        {hasHeroVideo ? (
          <div
            className="hero-backdrop hero-backdrop-cinema hero-backdrop-cinema--fullscreen pointer-events-none absolute z-0 overflow-hidden"
            aria-hidden
          >
            {heroVideoDark ? (
              <HeroBackdropVideo
                key={heroVideoDark}
                src={heroVideoDark}
                className="hero-backdrop-video hero-backdrop-video--dark pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
              />
            ) : null}
            {heroVideoLight ? (
              <HeroBackdropVideo
                key={heroVideoLight}
                src={heroVideoLight}
                className="hero-backdrop-video hero-backdrop-video--light pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
              />
            ) : (
              <div
                className="hero-backdrop-light hero-backdrop-theme-fallback pointer-events-none absolute inset-0 z-0"
                aria-hidden
              />
            )}
            {!heroVideoDark ? (
              <div
                className="hero-backdrop-dark-fallback pointer-events-none absolute inset-0 z-0 bg-[var(--bg)]"
                aria-hidden
              />
            ) : null}
            <div className="hero-video-overlay pointer-events-none absolute inset-0 z-[1]" aria-hidden />
            <div className="hero-video-glow pointer-events-none absolute inset-0 z-[1]" aria-hidden />
          </div>
        ) : (
          <div className="hero-backdrop hero-backdrop-light pointer-events-none absolute inset-0 z-0" aria-hidden />
        )}

        <Reveal
          eager
          className={`hero-copy relative z-10 w-full py-10 pb-12 sm:py-12 sm:pb-14 md:py-14 md:pb-16${
            hasHeroVideo ? " section-container" : ""
          }${headerOverlay ? " hero-copy--overlay-header" : ""}`}
          style={
            hasHeroVideo
              ? { minHeight: "calc(100dvh - var(--header-height, 4rem))" }
              : undefined
          }
        >
          <p className="hero-badge mb-5 inline-flex rounded-full border border-[var(--accent)]/40 bg-[rgba(225,29,72,0.08)] px-4 py-1.5 text-sm font-medium text-accent sm:mb-6">
            Веб-студия для бизнеса, которому нужны заявки
          </p>
          <h1 className="hero-title mt-[20px] text-[clamp(1.75rem,4.5vw,3.75rem)] font-bold leading-[1.1] tracking-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]">
            <span className="block lg:whitespace-nowrap" data-content-field="heroTitle">
              {settings.heroTitle}
            </span>
            <span
              className="mt-2 block text-accent lg:whitespace-nowrap"
              data-content-field="heroHighlight"
            >
              {settings.heroHighlight}
            </span>
          </h1>
          <div className="mt-[69px]">
            <p
              className="hero-lead mt-6 max-w-2xl text-lg text-[var(--text-muted)] drop-shadow-[0_1px_12px_rgba(0,0,0,0.5)]"
              data-content-field="heroSubtitle"
            >
              {settings.heroSubtitle}
            </p>

            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {HERO_BENEFITS.map((item) => (
                <li
                  key={item}
                  className="hero-meta flex items-center gap-2 text-sm text-[var(--text-muted)] drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]"
                >
                  <CheckCircle2 size={16} className="shrink-0 text-accent" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-[52px] flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="#contact" className="btn-primary btn-shimmer inline-flex justify-center">
                <span className="relative z-10" data-button-field="heroPrimary">
                  {settings.buttonLabels.heroPrimary}
                </span>
                <ArrowRight size={18} className="relative z-10" aria-hidden />
              </a>
              <a href="#cases" className="btn-outline inline-flex justify-center" data-button-field="heroSecondary">
                {settings.buttonLabels.heroSecondary}
              </a>
            </div>
            <p
              className="hero-meta mt-4 text-sm text-[var(--text-muted)] drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)]"
              data-content-field="heroMeta"
            >
              {settings.heroMeta}
            </p>
          </div>
        </Reveal>
      </div>

      <div
        className={
          hasHeroVideo ? "hero-below-video section-container" : undefined
        }
      >
        <Dashboard heroFeatures={heroFeatures} />

        {miniFeatures.length > 0 && (
        <div className="mt-10 grid gap-3 border-t border-[var(--border)]/50 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {miniFeatures.map((f, index) => (
            <Reveal key={`mini-${f.id}`} eager delay={200 + index * 40}>
              <div className="card-surface card-interactive flex items-center gap-3 p-4">
                <DynamicIcon name={f.icon} className="shrink-0 text-accent" />
                <span className="text-sm font-medium">{f.title}</span>
              </div>
            </Reveal>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
