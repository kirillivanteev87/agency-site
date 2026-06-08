#!/usr/bin/env node
/**
 * Единый dev: Next.js (фронт + API) с Fast Refresh.
 * — освобождает порт перед стартом (нет EADDRINUSE после перезапусков)
 * — prisma migrate deploy + generate перед стартом Next
 * — мягкий перезапуск при неожиданном падении процесса
 */
import { spawn } from "node:child_process";
import { execSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const PORT = process.env.PORT ?? "3001";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function portPids() {
  try {
    const out = execSync(`lsof -ti :${PORT} 2>/dev/null`, { encoding: "utf8" }).trim();
    return out ? out.split("\n").filter(Boolean) : [];
  } catch {
    return [];
  }
}

/** Не убиваем обёртку и живой дочерний next (если ещё поднимается). */
function protectedPids() {
  const protectedSet = new Set([String(process.pid)]);
  if (child?.pid) protectedSet.add(String(child.pid));
  return protectedSet;
}

async function freePort({ force = false } = {}) {
  const skip = protectedPids();
  let pids = portPids().filter((pid) => !skip.has(pid));
  if (!pids.length) return;

  for (const pid of pids) {
    console.log(`[dev] Порт ${PORT} занят (PID ${pid}) — останавливаем старый процесс`);
    try {
      process.kill(Number(pid), force ? "SIGKILL" : "SIGTERM");
    } catch {
      /* already gone */
    }
  }

  for (let attempt = 0; attempt < 24; attempt += 1) {
    await sleep(250);
    pids = portPids().filter((pid) => !protectedPids().has(pid));
    if (!pids.length) return;

    if (attempt >= 8 || force) {
      for (const pid of pids) {
        try {
          process.kill(Number(pid), "SIGKILL");
        } catch {
          /* already gone */
        }
      }
    }
  }
}

/** Ждём, пока порт свободен, чтобы не ловить EADDRINUSE при старте Next. */
async function ensurePortFree() {
  await freePort({ force: true });
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const busy = portPids().filter((pid) => !protectedPids().has(pid));
    if (!busy.length) {
      await sleep(300);
      return;
    }
    await sleep(200);
    if (attempt === 12) await freePort({ force: true });
  }
  await freePort({ force: true });
  await sleep(500);
}

function preparePrisma() {
  const schemaPath = join(root, "prisma/schema.prisma");
  if (!existsSync(schemaPath)) return;

  try {
    console.log("[dev] prisma migrate deploy…");
    execSync("npx prisma migrate deploy", { stdio: "inherit", cwd: root });
  } catch (e) {
    console.warn("[dev] prisma migrate deploy не выполнен:", e instanceof Error ? e.message : e);
  }

  const clientDir = join(root, "node_modules/.prisma/client");
  const schemaMtime = existsSync(schemaPath) ? statSync(schemaPath).mtimeMs : 0;
  const clientMtime = existsSync(clientDir) ? statSync(clientDir).mtimeMs : 0;
  if (!existsSync(clientDir) || schemaMtime > clientMtime) {
    console.log("[dev] prisma generate…");
    execSync("npx prisma generate", { stdio: "inherit", cwd: root });
    console.log(
      "[dev] После смены schema перезапустите dev (Ctrl+C → npm run dev). Уже запущенный Next не подхватит новый Client.",
    );
  } else {
    console.log("[dev] Prisma Client актуален — generate пропущен");
  }
}

let child = null;
let shuttingDown = false;
let restartTimer = null;
let restartAttempts = 0;

function isExpectedStop(code, signal) {
  if (signal === "SIGTERM" || signal === "SIGINT" || code === 143 || code === 130) return true;
  /** Next/Turbopack may exit 0 on a clean stop — restarting caused EADDRINUSE + browser reload loops */
  if (code === 0) return true;
  return false;
}

function shouldAutoRestart(code) {
  if (code === 1) return true;
  return typeof code === "number" && code !== 0;
}

async function restartAfterCrash(code, signal) {
  if (!shouldAutoRestart(code)) {
    console.error(`[dev] Процесс завершился (${signal ?? `код ${code}`}). Перезапуск не требуется.`);
    process.exit(code ?? 1);
    return;
  }

  restartAttempts += 1;
  if (restartAttempts > 8) {
    console.error("[dev] Слишком много перезапусков подряд. Остановка (проверьте порт и дубликаты npm run dev).");
    process.exit(1);
    return;
  }

  const reason = signal ?? `код ${code}`;
  const portBusy = portPids().filter((pid) => !protectedPids().has(pid));
  const needsPortCleanup = portBusy.length > 0 || code === 1;

  console.error(
    `[dev] Процесс завершился (${reason}).${
      portBusy.length ? ` Порт ${PORT} занят (PID ${portBusy.join(", ")}).` : ""
    } Освобождаем порт и перезапускаем…`,
  );

  if (needsPortCleanup) {
    await ensurePortFree();
  } else {
    await sleep(1200);
  }

  if (!shuttingDown) startNext();
}

function startNext() {
  console.log(`[dev] Старт: http://localhost:${PORT} (сайт + /api, автообновление в браузере)`);

  const nextArgs = ["next", "dev", "-p", PORT];
  if (process.env.DEV_NO_TURBO !== "1") {
    nextArgs.splice(2, 0, "--turbo");
  }

  child = spawn("npx", nextArgs, {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      PORT,
      NODE_ENV: "development",
      /** Меньше ложных пересборок при серии сохранений */
      WATCHPACK_DEBOUNCE: process.env.WATCHPACK_DEBOUNCE ?? "800",
    },
  });

  const stableTimer = setTimeout(() => {
    restartAttempts = 0;
  }, 60_000);
  child.once("exit", () => clearTimeout(stableTimer));

  child.on("exit", (code, signal) => {
    child = null;
    if (shuttingDown) {
      process.exit(0);
      return;
    }
    if (isExpectedStop(code, signal)) {
      process.exit(code === 0 ? 0 : code ?? 0);
      return;
    }
    restartTimer = setTimeout(() => {
      restartTimer = null;
      void restartAfterCrash(code, signal);
    }, 400);
  });
}

function shutdown() {
  shuttingDown = true;
  if (restartTimer) clearTimeout(restartTimer);
  if (child) {
    child.kill("SIGTERM");
    setTimeout(() => process.exit(0), 500);
  } else {
    process.exit(0);
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await ensurePortFree();
preparePrisma();
startNext();
