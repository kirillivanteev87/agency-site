#!/usr/bin/env node
/**
 * Re-encode default hero videos for web (720p/1080p, <3 MB) and extract WebP posters.
 *
 * Usage: node scripts/compress-hero-video.mjs
 * Requires: ffmpeg (system) or npm package ffmpeg-static (npx npm i -D ffmpeg-static)
 *
 * Outputs:
 *   public/video/hero-dark.mp4   + hero-dark.webp   (from 1778997378487-…3840_2160…)
 *   public/video/hero-light.mp4  + hero-light.webp  (from hero.mp4)
 *
 * Safe to delete after running (legacy uploads / duplicates, ~380 MB total):
 *   1778996119486-14131041_1920_1080_30fps.mp4  (18M)
 *   1778996130927-14131041_1920_1080_30fps.mp4  (18M)
 *   1778996267856-14131041_1920_1080_30fps.mp4  (18M)
 *   1778996307774-14131041_1920_1080_30fps.mp4  (18M)
 *   1778996401680-14131041_1920_1080_30fps.mp4  (18M)
 *   1778996408167-14131041_1920_1080_30fps.mp4  (18M)
 *   1778996460977-small.mp4                     (10B, broken stub)
 *   1778996602934-14131041_1920_1080_30fps.mp4  (18M)
 *   1778997378487-14519720_3840_2160_25fps.mp4 (11M) — replaced by hero-dark.mp4
 *   1779186153776-14519720_3840_2160_25fps.mp4 (11M) — duplicate dark footage
 *   1779186162943-14683903_3840_2160_30fps.mp4  (26M)
 *   1779186172924-14683903_3840_2160_30fps.mp4  (26M)
 *   1779186548471-tiny-test.mp4                  (1K)
 *   1779186653581-hero.mp4                       (18M) — duplicate light footage
 *   1779186857692-14471387_1920_1080_30fps.mp4  (28M)
 *   1779187303255-19419586-hd_1920_1080_30fps.mp4 (7M)
 *   1779188391293-14683909_3840_2160_30fps.mp4  (32M)
 *   1779188636551-14683909_3840_2160_30fps.mp4  (32M)
 *   1779188645942-14519720_3840_2160_25fps.mp4  (11M) — duplicate dark footage
 *   1779420379689-14683909_3840_2160_30fps.mp4  (32M)
 *   hero.mp4                                     (18M) — replaced by hero-light.mp4
 *
 * Keep hero-dark.* and hero-light.* — these are the production defaults.
 * DB URLs pointing at legacy paths are auto-redirected in src/lib/hero-video-urls.ts.
 */
import { spawnSync } from "node:child_process";
import { statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const videoDir = path.join(root, "public", "video");

function resolveFfmpeg() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("ffmpeg-static");
    const bin = mod.default ?? mod;
    if (bin && typeof bin === "string") return bin;
  } catch {
    /* optional dependency */
  }
  return "ffmpeg";
}

function run(ffmpeg, args) {
  const r = spawnSync(ffmpeg, args, { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function sizeLabel(file) {
  const bytes = statSync(file).size;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const ffmpeg = resolveFfmpeg();

const jobs = [
  {
    label: "dark",
    src: path.join(videoDir, "1778997378487-14519720_3840_2160_25fps.mp4"),
    out: path.join(videoDir, "hero-dark.mp4"),
    poster: path.join(videoDir, "hero-dark.webp"),
    scale: "1280:-2",
    maxrate: "1200k",
    bufsize: "2400k",
  },
  {
    label: "light",
    src: path.join(videoDir, "hero.mp4"),
    out: path.join(videoDir, "hero-light.mp4"),
    poster: path.join(videoDir, "hero-light.webp"),
    scale: "1280:-2",
    maxrate: "2000k",
    bufsize: "4000k",
  },
];

for (const job of jobs) {
  console.log(`\n→ Encoding hero-${job.label}…`);
  run(ffmpeg, [
    "-y",
    "-i",
    job.src,
    "-vf",
    `scale=${job.scale}`,
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "28",
    "-maxrate",
    job.maxrate,
    "-bufsize",
    job.bufsize,
    "-movflags",
    "+faststart",
    "-an",
    "-pix_fmt",
    "yuv420p",
    job.out,
  ]);
  run(ffmpeg, [
    "-y",
    "-ss",
    "0",
    "-i",
    job.out,
    "-frames:v",
    "1",
    "-vf",
    "scale=1920:-2",
    "-c:v",
    "libwebp",
    "-quality",
    "82",
    job.poster,
  ]);
  console.log(`  ${path.basename(job.out)}: ${sizeLabel(job.out)}`);
  console.log(`  ${path.basename(job.poster)}: ${sizeLabel(job.poster)}`);
}

console.log("\nDone. Update defaults in prisma/seed.ts and src/lib/hero-video-urls.ts if paths change.");
