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

## Apply an update

`applyUpdate(dependencies, request)` runs one update. The caller passes the running version and the parsed release manifest as `unknown`; the updater validates both with zod. The Docker runner, the backup service, the status store and the health probes are injected, so the state machine itself does not touch the Docker socket or the network. The real Docker runner belongs to the update API issue, which must implement the contract in `src/types.ts`.

The steps run in this order:

1. `verify_version`: the current version must be at least `minimumPreviousVersion` and the target must be newer. Otherwise the outcome is `refused` and nothing else runs.
2. `backup`: `createBackup` takes a backup named for the current version. A failure ends the update as `failed_before_change`.
3. `pull`: the running image references are read and kept as `previousImages`, then both new images are pulled by their digest reference from the manifest. A failure ends the update as `failed_before_change`, with no restore, because no container has changed.
4. `migrate`: the init job runs the new server image.
5. `replace`: the server and web containers are replaced with the new images.
6. `health`: `/api/health` on the server must return 2xx and the web app must return HTTP 200 within `OFFGRID_UPDATER_HEALTH_TIMEOUT_SECONDS`.

A failure in `migrate`, `replace` or `health` starts the rollback:

1. `rollback_stop`: both containers are stopped, so no server connection holds the database.
2. `rollback_restore`: the database is restored from the backup taken in this run. Secrets are not restored.
3. `rollback_start`: the previous image references are started.
4. `rollback_health`: both previous containers must become healthy.

Each rollback step runs once and is never retried. Success ends as `rolled_back`. A failure in any rollback step ends as `failed_needs_admin`, names that rollback step, and skips the steps after it.

Outcomes: `succeeded`, `refused`, `failed_before_change`, `rolled_back`, `failed_needs_admin`. An invalid manifest or request is not a status outcome: `applyUpdate` throws `UpdateRefusedError` and writes nothing.

Rollback restores the database to the backup, so every write made after the backup is lost. The status shows this with `writesAfterBackupLost: true` for `rolled_back`, and for any later outcome where the restore step succeeded.

### Status file

Each run rewrites `OFFGRID_UPDATER_STATUS_FILE` (default `data/updater/status.json`) atomically: a temporary file in the same folder, mode `0600`, then a rename. The status is written before and after each step. It is kept outside Postgres because a rollback restores the database and would erase the record.

The file holds only run identifiers, versions, image references, the backup folder name, step states, timestamps, the outcome and a fixed message per outcome. It never holds error text or secrets. `readUpdateStatus` returns `null` when no update has run and throws when the file does not match the schema. The server reads it through the update API.

### Limits

- If the updater process dies during an update, the status stays `in_progress`. Locking against concurrent runs and recovery of a stale run belong to the update API issue.
- `failed_needs_admin` means the database and the containers may not match the previous version. Restore by hand: stop the containers, restore the database as described in the Restore section, then start the previous images from the status file.
