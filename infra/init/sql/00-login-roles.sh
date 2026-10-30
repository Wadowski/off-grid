# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

set -eu

for secret in app-password migrator-password; do
  if [ ! -s "/run/secrets/$secret" ]; then
    echo "$secret is empty" >&2
    exit 1
  fi
done

{
  cat <<'SQL'
\set app_password `cat /run/secrets/app-password`
\set migrator_password `cat /run/secrets/migrator-password`
CREATE ROLE offgrid_migrator LOGIN PASSWORD :'migrator_password';
SQL
  for schema in identity family access calendar lists notes files food relations notifications export outbox; do
    printf 'CREATE ROLE %s_app LOGIN PASSWORD :'"'"'app_password'"'"';\n' "$schema"
  done
} | psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB"
