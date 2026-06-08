import { existsSync } from "node:fs";
import path from "node:path";

/** Optimized defaults — see scripts/compress-hero-video.mjs to regenerate */
export const DEFAULT_HERO_VIDEO_DARK = "/video/hero-dark.mp4";
export const DEFAULT_HERO_VIDEO_LIGHT = "/video/hero-light.mp4";
export const DEFAULT_HERO_POSTER_DARK = "/video/hero-dark.webp";
export const DEFAULT_HERO_POSTER_LIGHT = "/video/hero-light.webp";

/** Legacy seed paths → optimized files (same footage, smaller). Custom uploads are untouched. */
const LEGACY_HERO_VIDEO_MAP: Record<string, string> = {
  "/video/1778997378487-14519720_3840_2160_25fps.mp4": DEFAULT_HERO_VIDEO_DARK,
  "/video/1779186153776-14519720_3840_2160_25fps.mp4": DEFAULT_HERO_VIDEO_DARK,
  "/video/1779188645942-14519720_3840_2160_25fps.mp4": DEFAULT_HERO_VIDEO_DARK,
  "/video/hero.mp4": DEFAULT_HERO_VIDEO_LIGHT,
  "/video/1779186653581-hero.mp4": DEFAULT_HERO_VIDEO_LIGHT,
};

const LEGACY_HERO_POSTER_MAP: Record<string, string> = {
  "/video/1778997378487-14519720_3840_2160_25fps.mp4": DEFAULT_HERO_POSTER_DARK,
  "/video/1779186153776-14519720_3840_2160_25fps.mp4": DEFAULT_HERO_POSTER_DARK,
  "/video/1779188645942-14519720_3840_2160_25fps.mp4": DEFAULT_HERO_POSTER_DARK,
  "/video/hero.mp4": DEFAULT_HERO_POSTER_LIGHT,
  "/video/1779186653581-hero.mp4": DEFAULT_HERO_POSTER_LIGHT,
};

function publicFileExists(urlPath: string): boolean {
  if (!urlPath.startsWith("/")) return true;
  return existsSync(path.join(process.cwd(), "public", urlPath.slice(1)));
}

/** Keeps external URLs; redirects known legacy paths; falls back when a local file is missing */
export function resolveHeroVideoUrl(url: string | null | undefined, fallback: string): string {
  const trimmed = (url ?? "").trim();
  const candidate = trimmed || fallback;
  if (!candidate.startsWith("/video/")) return candidate;

  const optimized = LEGACY_HERO_VIDEO_MAP[candidate];
  if (optimized && publicFileExists(optimized)) return optimized;

  if (!publicFileExists(candidate)) {
    return publicFileExists(fallback) ? fallback : candidate;
  }
  return candidate;
}

/** Poster for a local hero video; empty for external URLs or when no poster file exists */
export function resolveHeroVideoPosterUrl(videoUrl: string): string {
  const trimmed = videoUrl.trim();
  if (!trimmed.startsWith("/video/")) return "";

  const legacyPoster = LEGACY_HERO_POSTER_MAP[trimmed];
  if (legacyPoster && publicFileExists(legacyPoster)) return legacyPoster;

  if (trimmed === DEFAULT_HERO_VIDEO_DARK && publicFileExists(DEFAULT_HERO_POSTER_DARK)) {
    return DEFAULT_HERO_POSTER_DARK;
  }
  if (trimmed === DEFAULT_HERO_VIDEO_LIGHT && publicFileExists(DEFAULT_HERO_POSTER_LIGHT)) {
    return DEFAULT_HERO_POSTER_LIGHT;
  }

  const derived = trimmed.replace(/\.(mp4|webm|mov)$/i, ".webp");
  if (derived !== trimmed && publicFileExists(derived)) return derived;

  return "";
}
