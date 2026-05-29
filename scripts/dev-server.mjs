#!/usr/bin/env node
/**
 * Единый dev: Next.js (фронт + API) с Fast Refresh.
 * — освобождает порт перед стартом (нет EADDRINUSE после перезапусков)
 * — prisma generate только если менялась schema
 * — мягкий перезапуск при неожиданном падении процесса
 */
import { spawn } from "node:child_process";
import { execSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const PORT = process.env.PORT ?? "3000";

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

async function freePort() {
  const pids = portPids();
  if (!pids.length) return;

  for (const pid of pids) {
    console.log(`[dev] Порт ${PORT} занят (PID ${pid}) — останавливаем старый процесс`);
    try {
      process.kill(Number(pid), "SIGTERM");
    } catch {
      /* already gone */
    }
  }

  for (let attempt = 0; attempt < 20; attempt += 1) {
    await sleep(250);
    const remaining = portPids();
    if (!remaining.length) return;

    if (attempt === 11) {
      for (const pid of remaining) {
        console.log(`[dev] PID ${pid} всё ещё держит порт ${PORT} — принудительно завершаем`);
        try {
          process.kill(Number(pid), "SIGKILL");
        } catch {
          /* already gone */
        }
      }
    }
  }
}

function prismaGenerateIfNeeded() {
  const schemaPath = join(root, "prisma/schema.prisma");
  const clientDir = join(root, "node_modules/.prisma/client");
  if (!existsSync(schemaPath)) return;

  let needsGenerate = !existsSync(clientDir);
  if (!needsGenerate) {
    const schemaMtime = statSync(schemaPath).mtimeMs;
    const clientMtime = statSync(clientDir).mtimeMs;
    needsGenerate = schemaMtime > clientMtime;
  }

  if (needsGenerate) {
    console.log("[dev] prisma generate (обновилась schema)…");
    execSync("npx prisma generate", { stdio: "inherit", cwd: root });
  }
}

let child = null;
let shuttingDown = false;
let restartTimer = null;

function isExpectedStop(code, signal) {
  return signal === "SIGTERM" || signal === "SIGINT" || code === 143 || code === 130;
}

function startNext() {
  console.log(`[dev] Старт: http://localhost:${PORT} (сайт + /api, автообновление в браузере)`);

  child = spawn("npx", ["next", "dev", "--turbo", "-p", PORT], {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "development",
      /** Меньше ложных пересборок при серии сохранений */
      WATCHPACK_DEBOUNCE: process.env.WATCHPACK_DEBOUNCE ?? "500",
    },
  });

  child.on("exit", (code, signal) => {
    child = null;
    if (shuttingDown) {
      process.exit(0);
      return;
    }
    if (isExpectedStop(code, signal)) {
      process.exit(0);
      return;
    }
    if (code !== 0 && code !== null) {
      const pids = portPids();
      if (pids.length) {
        console.error(
          `[dev] Процесс завершился (код ${code}), но порт ${PORT} уже занят (PID ${pids.join(", ")}). Останавливаем wrapper.`,
        );
        process.exit(0);
        return;
      }
      console.error(`[dev] Процесс завершился (код ${code}). Перезапуск через 2 с…`);
      restartTimer = setTimeout(() => {
        restartTimer = null;
        startNext();
      }, 2000);
    }
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

await freePort();
await sleep(400);
prismaGenerateIfNeeded();
startNext();
