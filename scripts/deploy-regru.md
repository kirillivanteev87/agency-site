# Деплой agency-site на REG.RU

Пошаговая инструкция для production-размещения Next.js 16 + Prisma (SQLite) + загрузки файлов на VPS REG.RU.

> **Рекомендация:** для этого проекта нужен **VPS/VDS**, а не виртуальный (shared) хостинг.  
> Файл `vercel.json` в репозитории — для Vercel, на REG.RU не используется.

---

## 1. Какой тип хостинга REG.RU нужен

| Тип | Подходит? | Почему |
|-----|-----------|--------|
| **VPS/VDS** (облачный сервер) | ✅ **Рекомендуется** | Полный root, Node.js 20+, nginx, PM2/systemd, SQLite на диске, `public/uploads/` и `public/video/` |
| **Виртуальный хостинг** (Host-0, Host-2…) | ⚠️ Обычно **нет** | Node.js на shared-хостинге — ограниченный режим (часто только статика или простые скрипты). Нет постоянного Node-процесса, сложно с SSR Next.js, API routes, загрузками до 100 МБ |
| **Облачная PostgreSQL REG.RU** | ✅ Опционально | Если позже мигрируете с SQLite — удобно для нескольких инстансов. Сейчас проект на SQLite |

### Минимальные требования VPS

- **ОС:** Ubuntu 22.04 / 24.04 LTS (при заказе VPS в REG.RU можно выбрать шаблон «Node.js» или чистую Ubuntu)
- **RAM:** от **2 ГБ** (Next.js build + SQLite; 1 ГБ — риск OOM при `npm run build`)
- **Диск:** от **20 ГБ** SSD (код + `node_modules` + `.next` + БД + uploads/video)
- **Порты:** 22 (SSH), 80/443 (nginx)

Заказ: [reg.ru/vps](https://www.reg.ru/vps/) → выберите тариф (например VPS-2: 2 CPU / 2 GB RAM).

---

## 2. Переменные окружения

Скопируйте шаблон:

```bash
cp deploy/env.production.example .env
nano .env
```

| Переменная | Обязательно | Описание |
|------------|-------------|----------|
| `NODE_ENV` | да | `production` |
| `PORT` | да | `3000` (nginx проксирует сюда) |
| `NEXT_PUBLIC_SITE_URL` | да | `https://ваш-домен.ru` |
| `DATABASE_URL` | да | `file:/var/www/agency-site/data/production.db` |
| `SESSION_SECRET` | да | Случайная строка (`openssl rand -base64 32`) — сессия админки |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | первый деплой | Только для `npm run db:seed` |
| `SMTP_*`, `LEAD_NOTIFY_EMAIL` | нет | Письма о заявках |
| `DEEPSEEK_API_KEY` | нет | AI-чат |

---

## 3. Первоначальная настройка VPS (один раз)

Подключитесь по SSH (IP и пароль — в панели REG.RU → VPS → ваш сервер):

```bash
ssh root@ВАШ_IP
```

### 3.1. Обновление и базовые пакеты

```bash
apt update && apt upgrade -y
apt install -y curl git nginx certbot python3-certbot-nginx ufw
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

### 3.2. Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v   # v20.x
```

### 3.3. PM2 (менеджер процессов)

```bash
npm install -g pm2
mkdir -p /var/log/agency-site
```

Альтернатива PM2 — **systemd**: файл `deploy/agency-site.service`.

### 3.4. Каталог приложения

```bash
mkdir -p /var/www/agency-site/data
mkdir -p /var/www/agency-site/public/uploads
mkdir -p /var/www/agency-site/public/video
chown -R www-data:www-data /var/www/agency-site
```

### 3.5. Загрузка кода на сервер

**Вариант A — git (если репозиторий на GitHub/GitLab):**

```bash
cd /var/www
git clone https://github.com/ВАШ_АККАУНТ/agency-site.git agency-site
cd agency-site
cp deploy/env.production.example .env
nano .env   # заполните переменные
```

**Вариант B — rsync с локальной машины:**

```bash
# На вашем Mac:
export DEPLOY_HOST=root@ВАШ_IP
export DEPLOY_PATH=/var/www/agency-site
chmod +x scripts/deploy-regru.sh
./scripts/deploy-regru.sh --seed   # --seed только при первом деплое!
```

На сервере после rsync создайте `.env` вручную, если его ещё нет.

### 3.6. Сборка и база данных

```bash
cd /var/www/agency-site
npm ci
npm run db:deploy          # prisma migrate deploy
npm run build

# Первый запуск — создать админа и начальные данные:
ADMIN_USERNAME=admin ADMIN_PASSWORD='ваш-пароль' npm run db:seed
# Повторный seed перезапишет контент — на production не запускайте без необходимости!
```

### 3.7. Запуск приложения

**PM2:**

```bash
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup   # выполните команду, которую выведет pm2
```

**Или systemd:**

```bash
cp deploy/agency-site.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now agency-site
systemctl status agency-site
```

Проверка: `curl -I http://127.0.0.1:3000` → HTTP 200.

### 3.8. nginx + домен + SSL

1. В панели REG.RU привяжите домен к IP VPS (A-запись `@` и `www` → IP сервера).
2. Скопируйте и отредактируйте конфиг:

```bash
cp deploy/nginx-agency-site.conf /etc/nginx/sites-available/agency-site
nano /etc/nginx/sites-available/agency-site   # замените example.ru
ln -s /etc/nginx/sites-available/agency-site /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

3. SSL (Let's Encrypt):

```bash
certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
```

Обновите `NEXT_PUBLIC_SITE_URL=https://ваш-домен.ru` в `.env` и перезапустите приложение.

---

## 4. Обновление сайта (повторные деплои)

### Через rsync (с локальной машины)

```bash
export DEPLOY_HOST=root@ВАШ_IP
./scripts/deploy-regru.sh
```

Скрипт:
- синхронизирует код (без `node_modules`, `.next`, `.env`, локальной БД);
- **не трогает** `data/production.db`, `public/uploads/`, `public/video/` (если не передан `--with-media`);
- на сервере: `npm ci` → `prisma migrate deploy` → `npm run build` → перезапуск PM2.

Первый деплой с медиа с локали:

```bash
./scripts/deploy-regru.sh --seed --with-media
```

### Через git pull на сервере

```bash
cd /var/www/agency-site
git pull
npm ci
npm run db:deploy
npm run build
pm2 reload agency-site
```

---

## 5. Что должно сохраняться на сервере

| Путь | Назначение |
|------|------------|
| `data/production.db` | SQLite — все данные сайта и админки |
| `public/uploads/` | Загруженные изображения (админка) |
| `public/video/` | Hero-видео и загрузки |
| `.env` | Секреты (не в git) |

**Бэкап (рекомендуется cron):**

```bash
# /etc/cron.daily/agency-site-backup
tar czf /root/backups/agency-site-$(date +%F).tar.gz \
  /var/www/agency-site/data \
  /var/www/agency-site/public/uploads \
  /var/www/agency-site/public/video \
  /var/www/agency-site/.env
```

---

## 6. SQLite vs PostgreSQL на REG.RU

**SQLite (текущая схема)** — проще для одного VPS:
- `DATABASE_URL="file:/var/www/agency-site/data/production.db"`
- Один процесс Node, файловые uploads — всё на одном диске
- Делайте бэкапы файла `.db`

**PostgreSQL (REG.RU DB-хостинг)** — если нужен отказоустойчивый кластер или несколько инстансов:
1. Закажите PostgreSQL в REG.RU
2. В `prisma/schema.prisma` смените `provider = "postgresql"`
3. `DATABASE_URL="postgresql://user:pass@host:5432/dbname"`
4. Прогоните миграции заново (потребуется миграция данных из SQLite)

Для типичного корпоративного сайта с одним VPS **SQLite достаточно**.

---

## 7. Виртуальный хостинг REG.RU (если VPS нет)

На shared-хостинге REG.RU Node.js заявлен на старших тарифах, но:

- нет полноценного `next start` как daemon без ограничений панели;
- загрузки файлов в `public/uploads/` могут конфликтовать с политикой хостинга;
- `prisma migrate` и SQLite в домашней директории — нестабильно.

**Вывод:** экспорт статики (`next export`) не подходит — у проекта API routes, админка, uploads, SSR.  
Нужен **VPS** или другой PaaS с Node.js.

---

## 8. Чеклист после деплоя

- [ ] Сайт открывается по HTTPS
- [ ] `/admin` — вход с паролем из seed (смените пароль через БД или пересоздайте пользователя)
- [ ] Форма контактов / загрузка в админке работает
- [ ] `SESSION_SECRET` не равен `dev-secret`
- [ ] SMTP настроен (тест из админки, если есть)
- [ ] PM2/systemd перезапускает приложение после reboot (`pm2 startup` или `systemctl enable`)

---

## 9. Файлы деплоя в репозитории

| Файл | Назначение |
|------|------------|
| `scripts/deploy-regru.sh` | Rsync + сборка на сервере |
| `scripts/deploy-regru.md` | Эта инструкция |
| `deploy/env.production.example` | Шаблон `.env` |
| `deploy/nginx-agency-site.conf` | Reverse proxy |
| `deploy/ecosystem.config.cjs` | PM2 |
| `deploy/agency-site.service` | systemd (альтернатива PM2) |

Команды npm:

```bash
npm run build       # prisma generate + next build
npm run start:prod  # next start -H 127.0.0.1 (за nginx)
npm run db:deploy   # prisma migrate deploy
npm run db:seed     # начальные данные (осторожно на production!)
```
