#!/usr/bin/env node
/**
 * Pick content source for production import: content-export.json (deploy) or prisma/dev.db (local).
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const exportPath = join(root, "prisma/content-export.json");
const sqlitePath = join(root, "prisma/dev.db");

const env = { ...process.env };
if (existsSync(exportPath)) {
  env.CONTENT_JSON = exportPath;
  console.log("[import] Using content-export.json");
} else if (existsSync(sqlitePath)) {
  env.SQLITE_PATH = sqlitePath;
  console.log("[import] Using prisma/dev.db");
} else {
  throw new Error("No content source: add prisma/content-export.json or prisma/dev.db");
}

execSync("npm run db:import-sqlite", { stdio: "inherit", env, cwd: root });
