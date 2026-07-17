#!/usr/bin/env bash
set -euo pipefail

BRANCH="${ZHUBAO_DEPLOY_BRANCH:-sync/local-to-github}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_DIR="$(cd "$BACKEND_DIR/.." && pwd)"
DEFAULT_API_BASE_URL="https://jewelry-api.birdai-glasses.com"

cd "$REPO_DIR"
echo "[deploy] repo $REPO_DIR"
echo "[deploy] target origin/$BRANCH"

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "[deploy] working tree has tracked local changes; aborting"
  exit 2
fi

git fetch --prune origin "$BRANCH"
TARGET_COMMIT="$(git rev-parse "origin/$BRANCH")"
git checkout --detach "$TARGET_COMMIT"

if [[ "$(git rev-parse HEAD)" != "$TARGET_COMMIT" ]]; then
  echo "[deploy] checkout did not land on origin/$BRANCH"
  exit 2
fi

cd "$BACKEND_DIR"
export NODE_ENV="${NODE_ENV:-production}"
if [[ "$NODE_ENV" != "production" ]]; then
  echo "[deploy] NODE_ENV must be production"
  exit 2
fi
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "[deploy] DATABASE_URL is required for production migration"
  exit 2
fi
if [[ -z "${ZHUBAO_BACKUP_DIR:-}" ]]; then
  echo "[deploy] ZHUBAO_BACKUP_DIR is required for database backups"
  exit 2
fi
if [[ "$ZHUBAO_BACKUP_DIR" != /* || "$ZHUBAO_BACKUP_DIR" == "/" ]]; then
  echo "[deploy] ZHUBAO_BACKUP_DIR must be a specific absolute directory"
  exit 2
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [[ "$NODE_MAJOR" != "24" ]]; then
  echo "[deploy] Node 24 is required; active version is $(node -v)"
  exit 2
fi

if command -v corepack >/dev/null 2>&1; then
  corepack enable
fi

pnpm install --frozen-lockfile
pnpm run check:syntax
pnpm run check:lines
pnpm test

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "[deploy] pg_dump is required for migration backups"
  exit 2
fi
umask 077
mkdir -p -- "$ZHUBAO_BACKUP_DIR"
BACKUP_TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_PATH="$ZHUBAO_BACKUP_DIR/zhubao-${BACKUP_TIMESTAMP}-${TARGET_COMMIT}.dump"
echo "[deploy] creating database backup $BACKUP_PATH"
pg_dump --format=custom --file="$BACKUP_PATH" "$DATABASE_URL"
if [[ ! -s "$BACKUP_PATH" ]]; then
  echo "[deploy] database backup is empty; aborting migration"
  exit 2
fi
echo "[deploy] database backup verified"

pnpm run db:migrate

if [[ -n "${ZHUBAO_RESTART_CMD:-}" ]]; then
  echo "[deploy] restarting with ZHUBAO_RESTART_CMD"
  bash -lc "$ZHUBAO_RESTART_CMD"
elif [[ -n "${ZHUBAO_PM2_NAME:-}" ]]; then
  echo "[deploy] restarting pm2 $ZHUBAO_PM2_NAME"
  pm2 restart "$ZHUBAO_PM2_NAME" --update-env
elif [[ -n "${ZHUBAO_SERVICE_NAME:-}" ]]; then
  echo "[deploy] restarting systemd $ZHUBAO_SERVICE_NAME"
  sudo systemctl restart "$ZHUBAO_SERVICE_NAME"
else
  echo "[deploy] set ZHUBAO_RESTART_CMD, ZHUBAO_PM2_NAME, or ZHUBAO_SERVICE_NAME"
  exit 2
fi

if [[ "${ZHUBAO_SKIP_SMOKE:-false}" == "true" ]]; then
  echo "[deploy] smoke test skipped by ZHUBAO_SKIP_SMOKE=true"
else
  export ZHUBAO_API_BASE_URL="${ZHUBAO_API_BASE_URL:-$DEFAULT_API_BASE_URL}"
  sleep "${ZHUBAO_RESTART_SETTLE_SECONDS:-2}"
  node scripts/smoke-production-auth.js
fi
