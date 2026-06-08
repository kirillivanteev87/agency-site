# Деплой agency-site

## Рекомендуемая платформа: VPS (Timeweb / reg.ru / Selectel)

Проект использует **SQLite** и запись файлов в `public/uploads` и `public/video`.  
На serverless (Vercel, Cloudflare Workers) это **не работает** без переделки на PostgreSQL + S3/Blob.

VPS с постоянным диском — оптимальный путь без изменений кода.

---

## Чеклист перед продакшеном

### 1. Переменные окружения

Скопируйте `deploy/env.production.example` → `.env` на сервере и заполните:

| Переменная | Обязательно | Описание |
|------------|-------------|----------|
| `NODE_ENV` | да | `production` |
| `PORT` | да | `3000` (за nginx) |
| `NEXT_PUBLIC_SITE_URL` | да | `https://ваш-домен.ru` |
| `DATABASE_URL` | да | `file:/var/www/agency-site/data/production.db` |
| `SESSION_SECRET` | да | `openssl rand -base64 32` |
| `ADMIN_USERNAME` | при seed | Логин админки (только первый seed) |
| `ADMIN_PASSWORD` | при seed | Пароль админки (только первый seed) |
| `SMTP_HOST` | для заявок | SMTP-сервер |
| `SMTP_PORT` | для заявок | Обычно `465` |
| `SMTP_USER` | для заявок | Логин SMTP |
| `SMTP_PASS` | для заявок | Пароль / app-password |
| `SMTP_FROM` | для заявок | From-адрес |
| `LEAD_NOTIFY_EMAIL` | для заявок | Куда слать заявки |
| `DEEPSEEK_API_KEY` | опционально | AI-чат |
| `DEEPSEEK_MODEL` | опционально | По умолчанию `deepseek-chat` |

`.env` в git **не коммитится** (см. `.gitignore`).

### 2. База данных

```bash
mkdir -p /var/www/agency-site/data
cd /var/www/agency-site
npx prisma migrate deploy
```

**Вариант A — перенести локальные данные** (контент уже в админке):

```bash
# с вашего Mac
scp prisma/dev.db user@server:/var/www/agency-site/data/production.db
```

**Вариант B — чистая БД + seed:**

```bash
ADMIN_USERNAME=admin ADMIN_PASSWORD='ваш-пароль' npm run db:seed
```

Seed не перезаписывает существующие hero/projects, если они уже есть.

### 3. Медиафайлы

```bash
# с вашего Mac (~450 МБ: uploads + video)
rsync -avz public/uploads public/video user@server:/var/www/agency-site/public/
```

### 4. Сборка и запуск

```bash
cd /var/www/agency-site
npm ci
npm run build
```

---

## Быстрый деплой на VPS (Ubuntu 22.04+)

### На сервере

```bash
# Node 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git

sudo mkdir -p /var/www/agency-site/data /var/log/agency-site
sudo chown -R www-data:www-data /var/www/agency-site /var/log/agency-site
```

### Доставка кода

**Git (рекомендуется):**

```bash
# На Mac: создайте репозиторий и запушьте
git remote add origin git@github.com:USER/agency-site.git
git add -A && git commit -m "feat: production-ready site"
git push -u origin main

# На сервере
sudo -u www-data git clone git@github.com:USER/agency-site.git /var/www/agency-site
```

**Или rsync без git:**

```bash
rsync -avz --exclude node_modules --exclude .next --exclude dev.db \
  /Users/kirillivanteev/progect/agency-site/ user@server:/var/www/agency-site/
```

### .env, миграции, сборка

```bash
sudo -u www-data cp deploy/env.production.example /var/www/agency-site/.env
sudo nano /var/www/agency-site/.env   # заполнить секреты

sudo -u www-data bash -lc 'cd /var/www/agency-site && npm ci && npx prisma migrate deploy && npm run build'
```

### systemd + nginx

```bash
sudo cp /var/www/agency-site/deploy/agency-site.service /etc/systemd/system/
sudo cp /var/www/agency-site/deploy/nginx-agency-site.conf /etc/nginx/sites-available/agency-site
# Отредактируйте server_name в nginx-конфиге

sudo ln -sf /etc/nginx/sites-available/agency-site /etc/nginx/sites-enabled/
sudo systemctl daemon-reload
sudo systemctl enable --now agency-site
sudo nginx -t && sudo systemctl reload nginx
```

### SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d example.ru -d www.example.ru
```

---

## Timeweb Cloud / reg.ru

1. Создайте **VPS** (1 vCPU, 1–2 GB RAM, Ubuntu 22.04).
2. Привяжите домен (A-запись → IP сервера).
3. Выполните шаги выше.
4. В панели Timeweb можно использовать встроенный nginx или свой (как в шаблоне).

---

## Альтернатива: Vercel (требует доработки)

Сейчас **не готово** к Vercel из коробки:

| Проблема | Решение |
|----------|---------|
| SQLite | Перейти на PostgreSQL (Neon / Supabase / Vercel Postgres) |
| Миграции SQLite | Новый baseline для Postgres (`prisma db push` или squash) |
| Загрузки в `public/` | Vercel Blob / S3 / Cloudflare R2 |

Если перейдёте на Postgres, в `vercel.json` добавьте build:

```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build"
}
```

И переменные в Vercel Dashboard → Settings → Environment Variables.

---

## Проверка после деплоя

- [ ] Главная открывается по `https://домен.ru`
- [ ] `/admin/login` — вход с вашим паролем
- [ ] Форма контактов отправляет заявку (SMTP)
- [ ] Загрузка изображения в админке сохраняется
- [ ] `curl -I https://домен.ru` → 200

## Локальная проверка сборки

```bash
npm run build   # уже проходит
NODE_ENV=production npm start
```
