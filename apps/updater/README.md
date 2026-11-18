# Updater

The updater is an app, not a module. It holds the only Docker socket in the stack (from OG-167 on) and has no module schema.

This package is the backup and restore core used before an update: it dumps the `offgrid` database and copies the secrets directory into a backup folder, verifies the dump, and restores a dump on demand.

## Layout

- `src/config/`: environment and secret file loading, validated with zod.
- `src/backup/`: naming, retention, dump, verification, secrets copy, restore and health wait.
- `src/types.ts` and `src/constants.ts`: shared types and constants.

## Configuration

| Variable                                 | Default                            | Notes                                |
| ---------------------------------------- | ---------------------------------- | ------------------------------------ |
| `OFFGRID_UPDATER_DATABASE_HOST`          | required                           | Postgres host                        |
| `OFFGRID_UPDATER_DATABASE_PORT`          | `5432`                             |                                      |
| `OFFGRID_UPDATER_DATABASE_NAME`          | `offgrid`                          |                                      |
| `OFFGRID_UPDATER_DATABASE_USER`          | `offgrid_migrator`                 |                                      |
| `OFFGRID_UPDATER_MIGRATOR_PASSWORD_FILE` | required                           | File holding the migrator password   |
| `OFFGRID_UPDATER_SECRETS_DIRECTORY`      | `data/secrets`                     | `/run/secrets` in production         |
| `OFFGRID_UPDATER_BACKUP_ROOT`            | `data/backups`                     | `/backups` volume in production      |
| `OFFGRID_UPDATER_BACKUP_RETENTION`       | `3`                                | Newest backups kept, at least 1      |
| `OFFGRID_UPDATER_HEALTH_URL`             | `http://127.0.0.1:3000/api/health` | Server health, http or https only    |
| `OFFGRID_UPDATER_WEB_HEALTH_URL`         | `http://127.0.0.1:8080/`           | Web health, http or https only       |
| `OFFGRID_UPDATER_HEALTH_TIMEOUT_SECONDS` | `120`                              |                                      |
| `OFFGRID_UPDATER_STATUS_FILE`            | `data/updater/status.json`         | Update status file, outside Postgres |

## Backups

`createBackup` writes one folder per backup into the backup root:

- `offgrid-<version>-<UTC timestamp>/database.dump`: a `pg_dump --format=custom` dump of the `offgrid` database, taken as `offgrid_migrator`. The dump must pass `pg_restore --list` before the backup counts.
- `offgrid-<version>-<UTC timestamp>/secrets/`: a copy of the secrets directory, files mode `0600`.

Folders are created with mode `0700`. A failed backup removes its partial folder and prunes nothing. After a successful backup only the newest `OFFGRID_UPDATER_BACKUP_RETENTION` backups are kept, ordered by the timestamp in the name.

The updater needs `pg_dump` and `pg_restore` version 17 on its PATH. The password is passed to the tools through `PGPASSWORD`, never on the command line. The tools get no other environment variable than `PATH` and `PGPASSWORD`.

The backup folder holds the secrets in plaintext, including `mail-encryption-key`. Copying the folder copies that key with the data, so keep backups on the host or handle them as secrets. The migrator password must never reach `main-server` or any other runtime container.

## Restore

The restore covers the database only. The server must be stopped before a restore so that no connection holds the database.

The restore runs as `offgrid_migrator` with no superuser login and no `--no-owner`, so the restored objects keep their owners. It uses `--clean --if-exists --single-transaction --exit-on-error`, so a failed restore rolls back and leaves the database as it was. It needs the database and the scope helper owned by `offgrid_migrator`, which the `db-ownership` compose service (`infra/init/sql/03-migrator-ownership.sql`) sets on fresh and existing installs (ADR 0036). Any install that has not started through `db-ownership` must run it before a restore, or the restore fails with ownership errors. Objects that a later migration or init script creates as the superuser must be added to `03`.

Manual database restore, run from the host with the backup folder name in place of `<name>`:

```
PGPASSWORD="$(cat /path/to/migrator-password)" pg_restore --clean --if-exists \
  --single-transaction --exit-on-error --host <db-host> --port 5432 --username offgrid_migrator --dbname offgrid \
  <backup-root>/<name>/database.dump
```

Then start the server and check `GET /api/health` returns 2xx.

Manual secrets recovery: secrets are never restored automatically, because a restore after a failed update could overwrite secrets that were rotated since the backup. To recover a secret by hand, copy the file from `<backup-root>/<name>/secrets/` into the secrets directory (`data/secrets` or `/run/secrets`) and keep its mode at `0600`. Only do this when the database is also restored from the same backup, since the secrets must match the data they encrypt or sign.
