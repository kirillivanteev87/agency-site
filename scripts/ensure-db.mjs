#!/usr/bin/env node
/**
 * Применяет миграции, генерирует Prisma Client и при необходимости сидит БД.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: root, env: process.env });
}

if (!existsSync(join(root, ".env"))) {
  console.warn("[ensure-db] Нет файла .env — скопируйте deploy/env.local.example в .env с DATABASE_URL (PostgreSQL)");
}

run("npx prisma migrate deploy");
run("npx prisma generate");

if (existsSync(join(root, "prisma/seed.ts"))) {
  run("npx tsx prisma/seed.ts");
}
