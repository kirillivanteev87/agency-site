# Деплой agency-site на Vercel и привязка домена (REG.RU)

Пошаговое руководство: что мешает деплою **сейчас**, как подготовить проект и как выкатить на Vercel с кастомным доменом.

> **Краткий вывод:** в текущем виде проект **не готов** к Vercel без доработки. Нужны **PostgreSQL** вместо SQLite и **внешнее хранилище файлов** (Vercel Blob или аналог) вместо записи в `public/uploads` и `public/video`. После миграции — деплой через Git и настройка DNS в REG.RU.

---

## 1. Что блокирует Vercel сегодня

Vercel — **serverless**-платформа: каждый запрос выполняется в изолированной функции без постоянного диска.

| Проблема | Как устроено в проекте | Почему на Vercel не работает |
|----------|------------------------|------------------------------|
| **SQLite** | `prisma/schema.prisma` → `provider = "sqlite"`, `DATABASE_URL="file:..."` | Файл БД на диске **не сохраняется** между деплоями и инстансами. Данные пропадут после пересборки. |
| **Загрузки в `public/`** | `POST /api/upload`, `POST /api/admin/hero-video` пишут в `public/uploads` и `public/video` через `fs.writeFile` | Файловая система **только для чтения** (EROFS). Загрузки из админки падают с ошибкой (в коде уже есть подсказка про serverless). |
| **Локальные медиа в git** | Сотни файлов в `public/uploads/`, `public/video/` | Статика из репозитория **отдаётся**, но **новые** загрузки через админку не сохранятся. Контент, добавленный только на проде, потеряется. |
| **Миграции при старте** | На VPS: `prisma migrate deploy` на постоянном сервере | На Vercel миграции нужно запускать в **build** (см. ниже), а не полагаться на локальный `.db`. |

**Что уже работает на Vercel без изменений (после миграции БД и файлов):**

- SSR/SSG страниц Next.js 16
- API routes (админка, формы, brief, SMTP)
- Cookie-сессия админки (`SESSION_SECRET`)
- Статика из `public/images/`, шрифты, видео **из git** (как read-only)

**Что не блокирует, но важно знать:**

- `vercel.json` уже задаёт `maxDuration: 120` для `/api/upload` (большие файлы до 100 МБ) — на Pro-плане; на Hobby лимит меньше.
- `next.config.ts` → `images.remotePatterns` нужен только для `next/image`. Компонент `SiteImage` использует обычный `<img>`, поэтому URL из Vercel Blob **не требуют** правок в `remotePatterns` (если не перейдёте на `next/image`).

### 1.1. Ошибка `npm run vercel -- --prod`: FetchError / Internal Server Error

Типичный лог:

```
FetchError: invalid json response body at https://api.vercel.com/v2/files?teamId=...
reason: Unexpected token 'I', "Internal S"... is not valid JSON
AbortError: The user aborted a request.
```

**Причина:** CLI `vercel deploy` загружает **весь локальный проект** на `api.vercel.com/v2/files`. Ответ `"Internal Server Error"` (HTML/текст вместо JSON) — сбой API Vercel при **слишком большом или долгом upload**, часто из‑за сотен мегабайт статики.

| Путь | Размер (типично) | Уходит в deploy? |
|------|------------------|------------------|
| `public/video/` (все файлы) | **~384 MB** | Да (CLI и Git, если в repo) |
| Legacy `177*.mp4` + `hero.mp4` | **~381 MB** | Дубликаты, не нужны на проде |
| `hero-dark.mp4` + `hero-light.mp4` + `.webp` | **~3.7 MB** | Нужны |
| `public/uploads/` | **~67 MB** (99 файлов) | Контент сайта из git |
| `node_modules/` | **~788 MB** | CLI: исключить через `.vercelignore`; Git: не в repo |
| `.next/` | **~629 MB** | CLI: исключить; Git: не в repo |

**`.vercelignore`** (в корне репозитория) уменьшает payload **только для CLI**. Git Import **не читает** `.vercelignore` — там важно, что **закоммичено** в git.

**Что сделано в репозитории:**

- `.vercelignore` — исключает legacy-видео, `node_modules`, `.next`, `dev.db`.
- `.gitignore` — `public/video/177*.mp4`, `public/video/hero.mp4`, чтобы не коммитить дубликаты снова.

**Удалить legacy-видео с диска** (после `node scripts/compress-hero-video.mjs` — список файлов в шапке скрипта):

```bash
cd /path/to/agency-site
rm -f public/video/177*.mp4 public/video/hero.mp4
# Проверка: du -sh public/video  → должно быть ~4 MB
```

**Убрать legacy из git** (обязательно для Git Deploy, иначе clone всё равно ~380 MB видео):

```bash
git rm --cached public/video/177*.mp4 public/video/hero.mp4
git add .vercelignore .gitignore docs/vercel-deploy.md
git commit -m "Exclude legacy hero videos from deploy (~380 MB)"
git push origin main
```

**Рекомендуемый порядок деплоя:**

1. **Git Import (предпочтительно)** — Vercel клонирует repo и собирает на своих серверах; нет upload с вашей машины через `/v2/files`.
2. **CLI** — после `.vercelignore` и удаления legacy с диска: preview, затем prod.

---

## 2. Два пути

### Путь A — «Быстрый ответ» (целевая архитектура на Vercel)

После миграции на **PostgreSQL + Vercel Blob** деплой выглядит так:

#### 2.1. Подготовка кода (обязательно до первого деплоя)

1. **Prisma → PostgreSQL**
   - В `prisma/schema.prisma`: `provider = "postgresql"`.
   - Создать облачную БД (Neon, Supabase, Vercel Postgres, REG.RU Cloud PostgreSQL).
   - Применить схему: `npx prisma migrate deploy` или `npx prisma db push` (для нового baseline под Postgres).
   - Перенести данные из SQLite (экспорт/импорт или `db:seed` + ручной перенос контента).

2. **Файлы → Vercel Blob**
   - Установить `@vercel/blob`.
   - Переписать `src/app/api/upload/route.ts` и `src/app/api/admin/hero-video/route.ts`: вместо `writeFile` → `put()` в Blob, в БД сохранять **полный HTTPS URL** (например `https://xxx.public.blob.vercel-storage.com/...`).
   - Существующие файлы из `public/uploads` и `public/video` залить в Blob (скрипт или вручную) и обновить URL в БД.

3. **Сборка на Vercel** — обновить `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "prisma generate && prisma migrate deploy && next build",
  "functions": {
    "src/app/api/upload/route.ts": {
      "maxDuration": 120
    }
  }
}
```

4. **Переменные окружения** — см. раздел 4 и шаблон `deploy/env.vercel.example`.

#### 2.2. Деплой на Vercel

```bash
# CLI без глобальной установки (EACCES на macOS при npm i -g vercel)
cd /path/to/agency-site
npm install   # vercel уже в devDependencies

# Вариант A — через npm script (рекомендуется)
npm run vercel login
npm run vercel link          # выбрать команду / создать проект
npm run vercel env pull .env.vercel.local   # опционально: подтянуть env локально
npm run vercel               # preview-деплой
npm run vercel -- --prod     # production (после проверки preview)

# Вариант B — без установки в node_modules (одноразово)
npx vercel@latest login
npx vercel@latest link
npx vercel@latest
npx vercel@latest --prod
```

**Через Git (рекомендуется — без CLI upload):**

Vercel **не** заливает проект с вашего диска: `git clone` на build-сервере → `npm ci` → `buildCommand` из `vercel.json`. Ошибка `FetchError` на `/v2/files` **не возникает**.

1. Уберите legacy-видео из git (раздел 1.1), закоммитьте `.vercelignore`.
2. Запушьте репозиторий на GitHub/GitLab/Bitbucket.
3. [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → выберите repo.
4. Framework Preset: **Next.js** (авто).
5. Build Command: уже в `vercel.json` — `prisma generate && prisma migrate deploy && next build`.
6. Install Command: `npm ci` (по умолчанию).
7. **Environment Variables** (раздел 4) для Production и Preview.
8. **Deploy** — дальше каждый `git push` в подключённую ветку = новый деплой.

Dashboard: Project → **Deployments** → Redeploy без push: **⋯ → Redeploy**.

**CLI (если нужен ручной deploy с машины):**

Сначала убедитесь, что legacy-видео удалены локально и есть `.vercelignore`:

```bash
cd /path/to/agency-site
du -sh public/video   # ~4 MB, не ~384 MB
npm run vercel login
npm run vercel link
npm run vercel              # preview — проверить сборку
npm run vercel -- --prod    # production
```

Preview без prod: `npm run vercel -- --yes` (неинтерактивно, если проект уже linked).

#### 2.3. Первый запуск БД и админки

```bash
# Локально с production DATABASE_URL (осторожно!)
DATABASE_URL="postgresql://..." ADMIN_USERNAME=admin ADMIN_PASSWORD='...' npm run db:seed
```

Либо one-off через Vercel CLI / локально с prod URL. **Не** храните `ADMIN_PASSWORD` в build — только для одноразового seed.

---

### Путь B — минимальный план миграции (разумный объём)

Оценка: **1–2 дня** для опытного разработчика, без смены UI админки.

| Шаг | Действие | Файлы / артефакты |
|-----|----------|-------------------|
| 1 | Создать Postgres (Neon free tier или Vercel Postgres) | `DATABASE_URL` в Vercel |
| 2 | `provider = "postgresql"` в schema, `migration_lock.toml` → `postgresql` | `prisma/schema.prisma` |
| 3 | Baseline миграций под Postgres: `prisma migrate diff` / squash или `db push` на пустую БД | новая папка `prisma/migrations/` или один init migration |
| 4 | Seed + перенос медиа URL | `prisma/seed.ts`, скрипт upload-to-blob |
| 5 | `@vercel/blob` + общий helper `putMedia(file, folder)` | `src/lib/media-storage.ts`, правки 2 API routes |
| 6 | Env: `BLOB_READ_WRITE_TOKEN`, обновить `deploy/env.vercel.example` | Vercel Dashboard → Storage → Blob |
| 7 | `buildCommand` в `vercel.json` | см. путь A |
| 8 | Smoke-test: preview deploy → `/admin/login` → загрузка картинки → форма контактов | — |

**Не обязательно для MVP на Vercel:**

- Перенос всех исторических uploads из git в Blob (можно оставить старые пути `/uploads/...` как статику из repo, новые — только Blob).
- REG.RU VPS — альтернатива без миграции (см. `deploy/README.md`, `scripts/deploy-regru.md`).

**Scaffold в репозитории (без автодеплоя):**

- `deploy/env.vercel.example` — список переменных для Vercel.
- Этот документ — чеклист миграции.

Полная реализация Blob + Postgres в коде — отдельная задача; без неё `vercel --prod` **соберётся**, но админка и БД на проде **сломаются**.

---

## 3. Привязка домена REG.RU к Vercel

### 3.1. В панели Vercel

1. Project → **Settings** → **Domains**.
2. **Add** → введите `example.ru` и `www.example.ru`.
3. Vercel покажет **какие DNS-записи** нужны (значения могут отличаться — ориентируйтесь на экран Vercel).

Типичная схема:

| Домен | Тип | Имя / хост | Значение |
|-------|-----|------------|----------|
| `www.example.ru` | **CNAME** | `www` | `cname.vercel-dns.com` |
| `example.ru` (apex) | **A** | `@` | IP от Vercel (например `76.76.21.21`) **или** ANAME/ALIAS если REG.RU поддерживает |

> Актуальный IP и CNAME всегда смотрите в Vercel Domains — они могут обновляться.

### 3.2. В панели REG.RU

1. **Домены** → ваш домен → **DNS-серверы и зона**.
2. Используйте **DNS REG.RU** (не только parking), если управляете записями сами.
3. Добавьте записи из таблицы Vercel:

**Вариант 1 — apex + www на Vercel**

```
Тип: A      | Поддомен: @   | Значение: 76.76.21.21  (IP из Vercel)
Тип: CNAME  | Поддомен: www | Значение: cname.vercel-dns.com
```

**Вариант 2 — только www на Vercel, apex редирект**

Если A на apex на REG.RU неудобен:

- В REG.RU: **перенаправление домена** `example.ru` → `https://www.example.ru` (301).
- CNAME `www` → `cname.vercel-dns.com`.

**Вариант 3 — делегирование DNS на Vercel**

- В REG.RU сменить NS на `ns1.vercel-dns.com`, `ns2.vercel-dns.com` (если Vercel предлагает) — тогда все записи правите в Vercel.

### 3.3. SSL и проверка

- Vercel выпускает **Let's Encrypt** автоматически после успешной верификации DNS (обычно 5–60 минут, иногда до 24 ч).
- В Vercel Domains статус должен стать **Valid**.
- Обновите `NEXT_PUBLIC_SITE_URL=https://example.ru` (или `https://www.example.ru` — как решите canonical) в Environment Variables и **Redeploy**.

### 3.4. Чеклист после привязки домена

- [ ] `https://example.ru` открывается без ошибки сертификата
- [ ] `https://www.example.ru` редиректит на canonical (настроить в Vercel Domains → redirect)
- [ ] `/admin/login` — вход работает
- [ ] Форма контактов шлёт письмо (SMTP env)
- [ ] Загрузка в админке сохраняется и отображается (после Blob)

---

## 4. Переменные окружения на Vercel

Задайте в **Project → Settings → Environment Variables** (Production + Preview).

| Переменная | Обязательно | Описание |
|------------|-------------|----------|
| `NEXT_PUBLIC_SITE_URL` | да | `https://ваш-домен.ru` |
| `DATABASE_URL` | да | PostgreSQL connection string (`?sslmode=require` для Neon и др.) |
| `SESSION_SECRET` | да | Случайная строка: `openssl rand -base64 32` |
| `BLOB_READ_WRITE_TOKEN` | да* | Токен Vercel Blob (*после миграции загрузок) |
| `SMTP_HOST` | для заявок | SMTP-сервер |
| `SMTP_PORT` | для заявок | Обычно `465` |
| `SMTP_USER` | для заявок | Логин |
| `SMTP_PASS` | для заявок | Пароль / app-password |
| `SMTP_FROM` | для заявок | From-адрес |
| `LEAD_NOTIFY_EMAIL` | для заявок | Куда слать заявки |
| `ADMIN_USERNAME` | seed | Только для одноразового `db:seed`, не обязательно в runtime |
| `ADMIN_PASSWORD` | seed | То же |
| `DEEPSEEK_API_KEY` | нет | AI-чат |
| `DEEPSEEK_MODEL` | нет | По умолчанию `deepseek-chat` |

Шаблон: `deploy/env.vercel.example`.

**Не добавляйте в Vercel:**

- `PORT` — Vercel сам назначает порт
- `DATABASE_URL="file:..."` — SQLite на Vercel не использовать

---

## 5. Текущие конфиги в репозитории

### `vercel.json`

Сейчас:

```json
{
  "functions": {
    "src/app/api/upload/route.ts": { "maxDuration": 120 }
  }
}
```

- **Нет** `buildCommand` с `prisma migrate deploy` — добавьте после перехода на Postgres.
- `maxDuration: 120` — для больших upload/video; на Hobby Vercel лимит функции 10–60 с (зависит от плана).

### `next.config.ts`

```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "images.unsplash.com" },
  ],
},
```

- Для текущего `SiteImage` (`<img>`) **дополнительных доменов не нужно**.
- Если позже включите `next/image` для Blob, добавьте:

```ts
{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
```

(точный hostname смотрите в URL вашего Blob store).

---

## 6. Нужна ли миграция кода перед деплоем?

| Сценарий | Можно деплоить? | Результат |
|----------|-----------------|-----------|
| Деплой **как есть** (SQLite + local uploads) | Технически build может пройти | БД пустая/нестабильная, загрузки падают, контент не сохраняется |
| Деплой **только Postgres**, uploads не тронуты | Нет смысла | Сайт читается, админ-загрузки всё ещё ломаются |
| **Postgres + Blob** + env + buildCommand | ✅ Да | Полноценный прод на Vercel |

**Рекомендация:** не делать `vercel --prod` на боевой домен до завершения Postgres + Blob. Preview-деплой для проверки сборки — можно.

---

## 7. Альтернатива без миграции

Если нужен **быстрый прод без переписывания хранилища**:

- **VPS REG.RU / Timeweb** — SQLite и `public/uploads` работают из коробки.
- Инструкции: `deploy/README.md`, `scripts/deploy-regru.md`.

---

## 8. Полезные команды

```bash
# Локальная production-сборка (как на Vercel, без deploy)
npm run build

# Проверка env для Vercel (после vercel link)
npm run vercel -- env ls

# Логи production
npm run vercel -- logs --prod

# Привязка домена через CLI (опционально)
npm run vercel -- domains add example.ru
```

---

## 9. Краткая памятка

1. **Блокеры:** SQLite, запись в `public/`, ephemeral FS на Vercel.
2. **Решение:** PostgreSQL + Vercel Blob (или S3/R2), правки 2 upload API, `buildCommand` с migrate.
3. **Домен REG.RU:** CNAME `www` → Vercel; apex — A на IP Vercel или редирект на `www`.
4. **Env:** `DATABASE_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL`, `BLOB_READ_WRITE_TOKEN`, SMTP.
5. **Деплой:** Git → Vercel Import или `npm run vercel link` + `npm run vercel -- --prod` **после** миграции.
