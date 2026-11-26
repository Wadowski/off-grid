#!/bin/sh
# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

set -eu

REPO=/repo
PG_BIN=/usr/lib/postgresql/17/bin
PGDATA=/var/lib/pgdata
LOG_DIR=/var/log/offgrid
ARTIFACTS_OUT=$REPO/e2e/artifacts/container-logs
SERVER_PORT=3000
WEB_PORT=5173

export OFFGRID_HTTP_HOST=127.0.0.1
export OFFGRID_HTTP_PORT=$SERVER_PORT
export OFFGRID_DATABASE_HOST=127.0.0.1
export OFFGRID_DATABASE_NAME=offgrid
export OFFGRID_DATABASE_USER=offgrid_app
export OFFGRID_DATABASE_PASSWORD_FILE=/run/secrets/app-password
export OFFGRID_MAIL_ENCRYPTION_KEY_FILE=/run/secrets/mail-encryption-key
export OFFGRID_CORS_ORIGINS=http://127.0.0.1:$WEB_PORT
export OFFGRID_TRUSTED_PROXIES=127.0.0.0/8,172.16.0.0/12
export OFFGRID_FILES_DIRECTORY=/data/files
export OFFGRID_FILES_MAX_UPLOAD_BYTES=1048576

mkdir -p "$LOG_DIR" /run/secrets /data
chmod 0777 "$LOG_DIR"

SERVICE_PIDS=""

remember_service() {
  SERVICE_PIDS="$SERVICE_PIDS $!"
}

cleanup() {
  status=$?
  for pid in $SERVICE_PIDS; do kill "$pid" 2>/dev/null || true; done
  su postgres -c "$PG_BIN/pg_ctl -D $PGDATA -m fast stop" >/dev/null 2>&1 || true
  mkdir -p "$ARTIFACTS_OUT" && cp -r "$LOG_DIR"/. "$ARTIFACTS_OUT"/ 2>/dev/null || true
  exit "$status"
}
trap cleanup EXIT

wait_for_url() {
  wait_url=$1
  wait_label=$2
  wait_tries=240
  until curl -fsS -o /dev/null "$wait_url"; do
    wait_tries=$((wait_tries - 1))
    if [ "$wait_tries" -le 0 ]; then
      echo "$wait_label did not become ready at $wait_url" >&2
      tail -n 40 "$LOG_DIR"/*.log >&2 || true
      exit 1
    fi
    sleep 0.5
  done
}

SECRETS_DIR=/run/secrets FILES_ROOT=/data sh "$REPO/infra/compose/secrets-init.sh"

echo "127.0.0.1 mail" >> /etc/hosts

install -d -o postgres -g postgres "$PGDATA"
su postgres -c "$PG_BIN/initdb -D $PGDATA -U postgres --auth=trust -E UTF8 >/dev/null"
su postgres -c "$PG_BIN/pg_ctl -D $PGDATA -l $LOG_DIR/postgres.log -o '-c listen_addresses=127.0.0.1' -w start" >/dev/null

export PGHOST=127.0.0.1 PGUSER=postgres
psql -v ON_ERROR_STOP=1 -d postgres -qc 'CREATE DATABASE offgrid'

export POSTGRES_USER=postgres POSTGRES_DB=offgrid
sh "$REPO/infra/init/sql/00-login-roles.sh"
psql -v ON_ERROR_STOP=1 -d offgrid -q -f "$REPO/infra/init/sql/01-roles-and-schemas.sql"
psql -v ON_ERROR_STOP=1 -d offgrid -q -f "$REPO/infra/init/sql/02-scope-helpers.sql"
psql -v ON_ERROR_STOP=1 -d offgrid -q -f "$REPO/infra/init/sql/03-migrator-ownership.sql"

install -d -m 0777 /data/files
cd "$REPO/apps/main-server"
OFFGRID_DATABASE_USER=offgrid_migrator \
OFFGRID_DATABASE_PASSWORD_FILE=/run/secrets/migrator-password \
  node --import tsx src/migrate.ts >"$LOG_DIR/migrate.log" 2>&1

node --import tsx src/main.ts >"$LOG_DIR/server.log" 2>&1 &
remember_service

mailpit --smtp 0.0.0.0:1025 --listen 127.0.0.1:8025 >"$LOG_DIR/mail.log" 2>&1 &
remember_service

sed -e "s/listen 8080;/listen $WEB_PORT;/" \
    -e "s#root /usr/share/nginx/html;#root $REPO/apps/main-web/dist;#" \
    "$REPO/apps/main-web/nginx.conf" > /etc/nginx/conf.d/default.conf
nginx -g 'daemon off;' >"$LOG_DIR/web.log" 2>&1 &
remember_service

wait_for_url "http://127.0.0.1:$SERVER_PORT/api/health/ready" "server"
wait_for_url "http://127.0.0.1:$WEB_PORT/" "web app"
wait_for_url "http://127.0.0.1:8025/" "mail catcher"

if [ "$#" -eq 0 ]; then
  set -- --project chromium --grep-invert @wip
fi
cd "$REPO/e2e"
export E2E_REUSE_STACK=1
export BASE_URL=http://127.0.0.1:$SERVER_PORT
export E2E_SERVER_PORT=$SERVER_PORT E2E_WEB_PORT=$WEB_PORT
npx bddgen
npx playwright test --trace off "$@"
