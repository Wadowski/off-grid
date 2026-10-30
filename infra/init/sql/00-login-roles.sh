# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

set -eu

app_password=$(cat /run/secrets/app-password)

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<EOSQL
CREATE ROLE offgrid_migrator LOGIN PASSWORD '$(cat /run/secrets/migrator-password)';
EOSQL

for schema in identity family access calendar lists notes files food relations notifications export outbox; do
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
    -c "CREATE ROLE ${schema}_app LOGIN PASSWORD '$app_password';"
done
