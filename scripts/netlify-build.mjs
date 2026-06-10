#!/usr/bin/env node
/**
 * Netlify production build: Prisma generate, optional migrate, Next.js build.
 * Migrate is skipped when DATABASE_URL is unset; failures are logged but do not block next build.
 */
import { execSync } from "node:child_process";

function run(cmd, { allowFail = false } = {}) {
  try {
    execSync(cmd, { stdio: "inherit", env: process.env });
  } catch (error) {
    if (allowFail) {
      console.warn(`[build:netlify] Command failed (continuing): ${cmd}`);
      if (error instanceof Error) console.warn(error.message);
      return;
    }
    throw error;
  }
}

run("npx prisma generate");

const dbUrl = process.env.DATABASE_URL?.trim();
if (dbUrl) {
  if (!process.env.DATABASE_URL_UNPOOLED?.trim()) {
    process.env.DATABASE_URL_UNPOOLED = dbUrl;
  }
  process.env.PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK = "1";
  run("npx prisma migrate deploy", { allowFail: true });
} else {
  console.warn("[build:netlify] DATABASE_URL not set — skipping prisma migrate deploy");
}

run("npx next build");
