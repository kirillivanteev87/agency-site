#!/usr/bin/env bash
# Деплой agency-site на VPS reg.ru с локальной машины (rsync + SSH).
#
# Использование:
#   export DEPLOY_HOST=root@123.45.67.89
#   export DEPLOY_PATH=/var/www/agency-site
#   ./scripts/deploy-regru.sh
#
# Первый раз на сервере: scripts/deploy-regru.md → «Первоначальная настройка VPS»
#
# Опции:
#   --with-media   синхронизировать public/uploads и public/video с локальной машины
#   --seed         после миграций запустить prisma/seed.ts (только первый деплой!)
#   --no-build     не запускать npm run build на сервере (если уже собрали)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:-}"
REMOTE="${DEPLOY_PATH:-/var/www/agency-site}"
WITH_MEDIA=0
RUN_SEED=0
SKIP_BUILD=0

for arg in "$@"; do
  case "$arg" in
    --with-media) WITH_MEDIA=1 ;;
    --seed) RUN_SEED=1 ;;
    --no-build) SKIP_BUILD=1 ;;
    -h|--help)
      sed -n '2,14p' "$0"
      exit 0
      ;;
    *)
      echo "Неизвестный аргумент: $arg" >&2
      exit 1
      ;;
  esac
done

if [[ -z "$HOST" ]]; then
  echo "Задайте DEPLOY_HOST, например: export DEPLOY_HOST=root@123.45.67.89" >&2
  exit 1
fi

RSYNC_EXCLUDES=(
  --exclude node_modules
  --exclude .next
  --exclude .git
  --exclude .env
  --exclude .env.*
  --exclude dev.db
  --exclude '*.db-journal'
  --exclude prisma/dev.db
  --exclude data
  --exclude .DS_Store
  --exclude .vercel
)

if [[ "$WITH_MEDIA" -eq 0 ]]; then
  RSYNC_EXCLUDES+=(--exclude 'public/uploads/*' --exclude 'public/video/*')
fi

echo "==> Rsync → $HOST:$REMOTE"
rsync -avz --delete "${RSYNC_EXCLUDES[@]}" "$ROOT/" "$HOST:$REMOTE/"

REMOTE_CMD=$(cat <<EOF
set -euo pipefail
cd "$REMOTE"
mkdir -p data public/uploads public/video /var/log/agency-site
if [[ ! -f .env ]]; then
  echo "ОШИБКА: нет .env на сервере. Скопируйте deploy/env.production.example → .env" >&2
  exit 1
fi
npm ci
npx prisma migrate deploy
npx prisma generate
if [[ "$RUN_SEED" -eq 1 ]]; then
  npx tsx prisma/seed.ts
fi
if [[ "$SKIP_BUILD" -eq 0 ]]; then
  npm run build
fi
if command -v pm2 >/dev/null 2>&1; then
  pm2 reload deploy/ecosystem.config.cjs --update-env || pm2 start deploy/ecosystem.config.cjs
  pm2 save
else
  sudo systemctl restart agency-site || echo "PM2/systemd не найден — перезапустите приложение вручную"
fi
echo "==> Деплой завершён"
EOF
)

echo "==> Сборка и перезапуск на сервере"
ssh "$HOST" "bash -s" <<< "$REMOTE_CMD"
