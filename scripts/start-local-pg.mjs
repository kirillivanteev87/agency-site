#!/usr/bin/env node
/**
 * Local PostgreSQL when Docker is unavailable.
 * Equivalent to: docker run -d --name agency-pg -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=agency -p 5432:5432 postgres:16
 */
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const databaseDir = join(root, ".local-pg");
const port = 5432;
const user = "postgres";
const password = "dev";
const database = "agency";

const pg = new EmbeddedPostgres({
  databaseDir,
  user,
  password,
  port,
  persistent: true,
});

if (!existsSync(databaseDir)) {
  await pg.initialise();
}

await pg.start();

try {
  await pg.createDatabase(database);
} catch {
  // Database may already exist from a previous run.
}

console.log(
  `[local-pg] PostgreSQL on postgresql://${user}:${password}@localhost:${port}/${database}`,
);
console.log("[local-pg] Press Ctrl+C to stop.");

const shutdown = async () => {
  await pg.stop();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
