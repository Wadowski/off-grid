# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<EOSQL
CREATE ROLE offgrid_migrator LOGIN PASSWORD '$(cat /run/secrets/migrator-password)';
CREATE ROLE outbox_app LOGIN PASSWORD '$(cat /run/secrets/app-password)';
EOSQL
