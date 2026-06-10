# Деплой agency-site на Netlify

Пошаговое руководство по переносу с Vercel на Netlify: PostgreSQL (Neon), медиа, домен qnox.ru.

> **Краткий вывод:** проект готов к Netlify. База — тот же Neon `DATABASE_URL`. Медиа: **рекомендуется оставить `BLOB_READ_WRITE_TOKEN` от Vercel Blob** на переходный период (работает с Netlify, сохраняет старые URL). Без токена — Netlify Blobs + `/api/media/…`, но лимит тела запроса функции **~6 МБ** (крупные hero-video не загрузить).

---

## 1. Что изменилось по сравнению с Vercel

| Компонент | Vercel | Netlify |
|-----------|--------|---------|
| Конфиг сборки | `vercel.json` | `netlify.toml` |
| Next.js runtime | Vercel Functions | OpenNext adapter (авто) |
| PostgreSQL | Neon `DATABASE_URL` | **Тот же Neon** |
| Медиа (по умолчанию) | Vercel Blob при `VERCEL=1` | Netlify Blobs при `NETLIFY=true` |
| Медиа (миграция) | `BLOB_READ_WRITE_TOKEN` | **Тот же токен** — приоритет над Netlify Blobs |
| Лимит upload | до 100 МБ (Pro, 120s) | **~4.5–6 МБ** через API route; большие файлы — только через Vercel Blob / S3 |

`vercel.json` оставлен в репозитории, если понадобится откат на Vercel; Netlify его **не читает**.

---

## 2. Переменные окружения

Шаблон: `deploy/env.netlify.example`.

| Переменная | Обязательно | Описание |
|------------|-------------|----------|
| `NEXT_PUBLIC_SITE_URL` | да | `https://qnox.ru` |
| `DATABASE_URL` | да | Neon pooled URL |
| `DATABASE_URL_UNPOOLED` | рекомендуется | Neon direct URL (для `migrate deploy`). Если не задан — `build:netlify` использует `DATABASE_URL` |
| `SESSION_SECRET` | да | `openssl rand -base64 32` |
| `BLOB_READ_WRITE_TOKEN` | рекомендуется | Vercel Blob — старые URL + видео до 100 МБ |
| `SMTP_*`, `LEAD_NOTIFY_EMAIL` | для заявок | Как на Vercel |
| `DEEPSEEK_API_KEY` | опционально | AI-чат |

**Не задавайте:** `PORT`, SQLite `file:…`.

---

## 3. Деплой на Netlify

### 3.1. Через Git (рекомендуется)

1. Закоммитьте и запушьте изменения (включая `netlify.toml`).
2. [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**.
3. Подключите GitHub/GitLab/Bitbucket, выберите репозиторий `agency-site`.
4. Netlify подхватит `netlify.toml` (build command уже с `prisma migrate deploy`, плагин `@netlify/plugin-nextjs`).
5. **Site configuration → Build & deploy → Build settings → Publish directory:** нажмите **Clear** и оставьте поле **пустым**. Значение из UI (`publishOrigin: ui`) **перебивает** `netlify.toml` — корень репозитория, `.next`, `out` или `public` дают 404 после зелёной сборки. Publish задаёт только `@netlify/plugin-nextjs`.
6. **Site configuration → Environment variables** — скопируйте значения из Vercel / `deploy/env.netlify.example`.
7. Deploy → дождитесь зелёной сборки.
8. Проверьте preview URL, затем привяжите домен.

### 3.3. Если зелёная сборка, но 404 «Page not found»

Типичная причина — в Netlify UI задан **Publish directory** (в логе: `publish: /opt/build/repo`, `publishOrigin: ui`):

1. **Site configuration → Build & deploy → Build settings → Publish directory → Clear** (поле пустое).
2. Trigger deploy → проверьте preview URL.

Дополнительно:

- В `netlify.toml` должен быть `[[plugins]] package = "@netlify/plugin-nextjs"`.
- В `netlify.toml` **нет** `publish = …` — и в UI тоже не должно быть.
- Framework preset: **Next.js** (обычно определяется автоматически).

### 3.2. Через CLI

```bash
npm install
npm run netlify login
npm run netlify link          # создать / привязать сайт
npm run netlify env:import deploy/env.netlify.example  # или вручную в UI
npm run netlify:deploy        # preview
npm run netlify:deploy:prod   # production
```

Локальная эмуляция Netlify (Blobs + functions):

```bash
npm run netlify dev
```

Обычный `npm run dev` пишет медиа в `public/uploads` и `public/video`.

---

## 4. Домен qnox.ru (REG.RU → Netlify)

### 4.1. В панели Netlify

1. **Domain management → Add a domain** → `qnox.ru` и `www.qnox.ru`.
2. Netlify покажет нужные DNS-записи (актуальные значения — **только из UI**).

Типичная схема:

| Запись | Поддомен | Значение |
|--------|----------|----------|
| A | `@` | IP load balancer Netlify (из панели, часто `75.2.60.5`) |
| CNAME | `www` | `<your-site>.netlify.app` |

Альтернатива: делегировать NS на Netlify DNS — тогда все записи в Netlify.

### 4.2. В REG.RU

1. **Домены → qnox.ru → DNS-серверы и зона**.
2. Добавьте записи из Netlify (не копируйте IP с Vercel).
3. Удалите старые A/CNAME на `vercel-dns.com` / IP Vercel.
4. TTL 300–3600, подождите 5–60 мин (иногда до 24 ч).
5. В Netlify статус домена → **Verified**, SSL Let's Encrypt — автоматически.

### 4.3. Canonical URL

В Netlify: **Domain management → Options** — primary domain `qnox.ru` или `www.qnox.ru`, редирект второго на основной.

Обновите `NEXT_PUBLIC_SITE_URL` на выбранный canonical.

### 4.4. Почему это может помочь в РФ

Vercel и Netlify используют разные CDN/anycast. Блокировки по IP провайдера на Vercel **не гарантируют** ту же проблему на Netlify — проверьте доступность с целевых сетей после переключения DNS.

---

## 5. Медиа и миграция файлов

### 5.1. Существующий контент на Vercel Blob

URL вида `https://….public.blob.vercel-storage.com/...` в PostgreSQL **продолжат работать**, пока жив Blob store и токен. Менять БД не нужно.

### 5.2. Новые загрузки на Netlify

**С `BLOB_READ_WRITE_TOKEN`:** как на Vercel — публичные CDN URL.

**Без токена (только Netlify Blobs):**

- Файлы в store `agency-media`, URL в БД: `/api/media/uploads/…` или `/api/media/video/…`.
- Отдача через `GET /api/media/[...path]`.
- **Лимит:** тело POST к serverless функции ~6 МБ (~4.5 МБ бинарных данных) — hero-video 100 МБ **не пройдут**.

### 5.3. Статика в `public/`

`public/video/hero-dark.mp4`, `hero-light.mp4`, логотипы — деплоятся с билдом. Legacy `177*.mp4` в git не нужны.

### 5.4. Долгосрочно без Vercel

Варианты для больших файлов: Cloudflare R2, AWS S3 + presigned URL, или отдельный CDN. Netlify Blobs без обхода лимита Lambda подходит в основном для изображений.

---

## 6. Сборка и Prisma

`netlify.toml` вызывает `npm run build:netlify` → `scripts/netlify-build.mjs`:

1. `prisma generate`
2. Если задан `DATABASE_URL`: подставляет `DATABASE_URL_UNPOOLED` из unpooled URL или fallback на `DATABASE_URL`, затем `prisma migrate deploy` с `PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1`
3. `next build`

`PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1` — как на Vercel, чтобы избежать P1002 на Neon при migrate.

`prisma/schema.prisma` использует `directUrl = env("DATABASE_URL_UNPOOLED")` — скрипт выставляет переменную перед migrate, если unpooled не задан в Netlify env.

---

## 7. Проверка после деплоя

- [ ] Главная, `/projects`, `/cases`, `/reviews`
- [ ] `/admin` — логин, загрузка изображения
- [ ] Hero-video (если используете upload)
- [ ] Форма контакта / brief → письмо или запись в БД
- [ ] `https://qnox.ru` — SSL, редирект www

---

## 8. Откат на Vercel

`vercel.json` и скрипт `npm run vercel` сохранены. Верните DNS на Vercel, env в Vercel Dashboard — сайт снова на Vercel.

---

## 9. Полезные команды

```bash
# Локальная production-сборка
npm run build

# Netlify preview / prod
npm run netlify:deploy
npm run netlify:deploy:prod

# Логи
npm run netlify logs:function
```
