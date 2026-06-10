#!/usr/bin/env node
/**
 * Vercel production build: Prisma generate, optional content import, migrate, Next.js build.
 */
import { execSync } from "node:child_process";

function run(cmd, { allowFail = false } = {}) {
  try {
    execSync(cmd, { stdio: "inherit", env: process.env });
  } catch (error) {
    if (allowFail) {
      console.warn(`[build:vercel] Command failed (continuing): ${cmd}`);
      if (error instanceof Error) console.warn(error.message);
      return;
    }
    throw error;
  }
}

run("npx prisma generate");

const dbUrl =
  process.env.DATABASE_URL?.trim() ||
  process.env.DATABASE_POSTGRES_PRISMA_URL?.trim() ||
  process.env.DATABASE_POSTGRES_URL?.trim();

if (dbUrl) {
  process.env.DATABASE_URL = dbUrl;
  if (!process.env.DATABASE_URL_UNPOOLED?.trim()) {
    process.env.DATABASE_URL_UNPOOLED =
      process.env.DATABASE_POSTGRES_URL_NON_POOLING?.trim() || dbUrl;
  }
  process.env.PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK = "1";
  run("npx prisma migrate deploy", { allowFail: true });
  if (process.env.IMPORT_CONTENT === "1") {
    console.log("[build:vercel] IMPORT_CONTENT=1 — importing SQLite/content-export into PostgreSQL");
    run("node scripts/run-content-import.mjs");
  }
} else {
  console.warn("[build:vercel] DATABASE_URL not set — skipping prisma migrate deploy");
}

run("npx next build");
