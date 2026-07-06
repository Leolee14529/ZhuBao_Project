#!/usr/bin/env bash
set -euo pipefail

BRANCH="${ZHUBAO_DEPLOY_BRANCH:-sync/local-to-github}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_DIR="$(cd "$BACKEND_DIR/.." && pwd)"

cd "$REPO_DIR"
echo "[deploy] repo $REPO_DIR"
echo "[deploy] branch $BRANCH"

git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

cd "$BACKEND_DIR"
if command -v corepack >/dev/null 2>&1; then
  corepack enable
fi

pnpm install --frozen-lockfile
pnpm run db:migrate
pnpm run check:syntax
pnpm run check:lines

if [[ -n "${ZHUBAO_RESTART_CMD:-}" ]]; then
  echo "[deploy] restarting with ZHUBAO_RESTART_CMD"
  bash -lc "$ZHUBAO_RESTART_CMD"
elif command -v pm2 >/dev/null 2>&1 && pm2 describe zhubao-backend >/dev/null 2>&1; then
  echo "[deploy] restarting pm2 zhubao-backend"
  pm2 restart zhubao-backend --update-env
elif command -v systemctl >/dev/null 2>&1 && systemctl list-units --type=service --all | grep -q 'zhubao'; then
  service_name="$(systemctl list-units --type=service --all | awk '/zhubao/ {print $1; exit}')"
  echo "[deploy] restarting $service_name"
  sudo systemctl restart "$service_name"
else
  echo "[deploy] code and migration complete, but no restart target was detected."
  echo "[deploy] set ZHUBAO_RESTART_CMD, for example: export ZHUBAO_RESTART_CMD='pm2 restart zhubao-backend --update-env'"
  exit 2
fi

if [[ -n "${ZHUBAO_API_BASE_URL:-}" ]]; then
  node scripts/smoke-production-auth.js
else
  echo "[deploy] skip smoke test because ZHUBAO_API_BASE_URL is not set"
fi
