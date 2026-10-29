# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

set -eu

psql -v ON_ERROR_STOP=1 \
  -v migrator_password="$(cat /run/secrets/migrator-password)" \
  -v app_password="$(cat /run/secrets/app-password)" \
  --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<'EOSQL'
CREATE ROLE offgrid_migrator LOGIN PASSWORD :'migrator_password';
CREATE ROLE outbox_app LOGIN PASSWORD :'app_password';
EOSQL
