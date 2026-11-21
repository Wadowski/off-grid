# Updater

The updater is an app, not a module. It holds the only Docker socket in the stack and has no module schema. It runs as a process (`src/main.ts`) and as the `updater` container built from `Dockerfile`.

It has three parts. The backup and restore core dumps the `offgrid` database and copies the secrets directory before an update. The apply state machine runs one update at a time through the Docker Engine API. A small HTTP API on port 3100 lets the server check for a release, start an update and read its status.

## Layout

- `src/config/`: environment and secret file loading, validated with zod.
- `src/backup/`: naming, retention, dump, verification, secrets copy, restore and health wait.
- `src/apply/`: the update state machine and the status file.
- `src/docker/`: the Docker runner over the Engine API on the unix socket (`node:http`, no docker CLI in the image).
- `src/release/`: the release manifest from GitHub Releases, checked with `releaseManifestSchema`.
- `src/run/`: the single-run lock and the background run.
- `src/schedule/`: the nightly scheduler, the next run time, the server call that reads the nightly setting, and one nightly tick.
- `src/http/`: the Fastify API, the bearer token check and the fixed error bodies.
- `src/types.ts` and `src/constants.ts`: shared types and constants.

## Configuration

| Variable                                 | Default                            | Notes                                                     |
| ---------------------------------------- | ---------------------------------- | --------------------------------------------------------- |
| `OFFGRID_UPDATER_DATABASE_HOST`          | required                           | Postgres host                                             |
| `OFFGRID_UPDATER_DATABASE_PORT`          | `5432`                             |                                                           |
| `OFFGRID_UPDATER_DATABASE_NAME`          | `offgrid`                          |                                                           |
| `OFFGRID_UPDATER_DATABASE_USER`          | `offgrid_migrator`                 |                                                           |
| `OFFGRID_UPDATER_MIGRATOR_PASSWORD_FILE` | required                           | File holding the migrator password                        |
| `OFFGRID_UPDATER_SECRETS_DIRECTORY`      | `data/secrets`                     | `/run/secrets` in production                              |
| `OFFGRID_UPDATER_BACKUP_ROOT`            | `data/backups`                     | `/backups` volume in production                           |
| `OFFGRID_UPDATER_BACKUP_RETENTION`       | `3`                                | Newest backups kept, at least 1                           |
| `OFFGRID_UPDATER_HEALTH_URL`             | `http://127.0.0.1:3000/api/health` | Server health, http or https only                         |
| `OFFGRID_UPDATER_WEB_HEALTH_URL`         | `http://127.0.0.1:8080/`           | Web health, http or https only                            |
| `OFFGRID_UPDATER_HEALTH_TIMEOUT_SECONDS` | `120`                              |                                                           |
| `OFFGRID_UPDATER_STATUS_FILE`            | `data/updater/status.json`         | Update status file, outside Postgres                      |
| `OFFGRID_UPDATER_TOKEN_FILE`             | required                           | File holding the API bearer token                         |
| `OFFGRID_UPDATER_HTTP_HOST`              | `127.0.0.1`                        | API listen address, Compose sets `0.0.0.0`                |
| `OFFGRID_UPDATER_HTTP_PORT`              | `3100`                             | API port, never published                                 |
| `OFFGRID_UPDATER_RELEASE_REPOSITORY`     | required                           | `owner/name` of the release repo                          |
| `OFFGRID_UPDATER_DOCKER_SOCKET`          | `/var/run/docker.sock`             | Docker Engine unix socket                                 |
| `OFFGRID_UPDATER_COMPOSE_PROJECT`        | `offgrid`                          | Compose project of the containers                         |
| `OFFGRID_UPDATER_SERVER_URL`             | `http://127.0.0.1:3000`            | Server origin for the nightly setting, http or https only |
| `OFFGRID_UPDATER_NIGHTLY_TIME`           | `03:30`                            | Nightly check time, `HH:MM` in the process `TZ`           |

A missing, unreadable or empty token file, or a missing release repository, stops the process at start with a `ConfigError` that names the variable. The token and the file content never appear in an error message or a log line.

## HTTP API

The API listens on `OFFGRID_UPDATER_HTTP_PORT`. Every route needs `Authorization: Bearer <token>`. A missing, malformed or wrong token gets `401` with the body `{ "error": "unauthorized" }` and `www-authenticate: Bearer`. The token is compared in constant time on SHA-256 digests. Any other route gets `404 { "error": "not_found" }`, also with a token.

| Method and path | Success                                                                                                  | Errors                                                            |
| --------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `GET /status`   | `200 { "update": UpdateStatus \| null, "running": boolean }`, read from the status file and the run lock | `500 status_unreadable` when the file does not match the schema   |
| `POST /check`   | `200 { currentVersion, latestVersion, updateAvailable, updateAllowed }`, changes nothing                 | `502 release_source_unreachable`, `503 current_version_unknown`   |
| `POST /apply`   | `202 { started: true, targetVersion }`, body `{ "version": "X.Y.Z" }` only                               | `400 invalid_request`, `409 update_already_running`, `502`, `503` |

`POST /apply` takes the lock, reads the running version and the release manifest for the requested version, then returns `202` and runs `applyUpdate` in the background. The lock is released when the run ends in any outcome, including a thrown error. A release lookup that fails before the run starts gives `502` and leaves no status. `POST /check` works while a run is active. Error bodies are fixed and carry no error text.

The current version comes from the `org.opencontainers.image.version` label of the running server image. A local build without a release version label cannot be updated.

## Nightly update

The nightly automatic update is off by default. The updater starts a scheduler at process start, and the scheduler runs one tick per day at `OFFGRID_UPDATER_NIGHTLY_TIME` (default `03:30`) in the process time zone. Compose sets `TZ`; without it the slot is UTC. A fresh start does not run at once: it waits for the next slot.

One tick does this, in order:

1. Takes the run lock. A manual update that holds it makes the tick skip, so nightly and manual runs never overlap.
2. Reads the nightly setting from the server: `GET /api/system/updater/nightly` on `OFFGRID_UPDATER_SERVER_URL`, with the updater token. The updater keeps no copy of the setting. When the setting is off, or the reply is not readable, the tick stops here and makes no call to GitHub.
3. Loads the release manifest for the latest release, the same call as `POST /check`.
4. If a newer release exists and the running version may update to it, runs `applyUpdate` once. The backup, pull, replace, health and rollback steps are the ones described above, and the outcome is written to the status file.

A failed night is not retried that night. The scheduler computes the next slot from the slot that just ran, not from the time the run ended, so a long run that passes 03:30 does not start a second run that night. The next night tries again only if a newer release is still pending, because the check decides that by itself. Apply failures show in `lastRun` through `GET /status`. A failure before a run starts (setting unreadable, release source unreachable, no newer release, not allowed) is logged only and writes no status. The logs never carry the token or the server's reply text.

Limits: the scheduler keeps its timer in memory. If the updater restarts across 03:30, that night is missed and the next slot runs. The updater is a single container, so there is no other instance to coordinate with.

## Docker

`createDockerRunner` implements the `DockerRunner` contract over the Engine API on the unix socket. Containers are found by the Compose labels `com.docker.compose.project` and `com.docker.compose.service` of `OFFGRID_UPDATER_COMPOSE_PROJECT`. The running images must have a registry digest (`ghcr.io/...@sha256:...`), or the update is refused.

- `pullImage` pulls the digest reference.
- `runInitJob` clones the `init` container with the new server image, runs it, removes it, and fails on a non-zero exit.
- `replaceContainers` stops each container, renames it to `<name>-replaced`, and creates and starts a new one from its config with the new image.
- `startContainers` restores the `-replaced` containers for a rollback.

The Compose environment is copied; variables that came from the old image are not, so the new image sets its own.

> **Socket warning.** Access to the Docker socket is root on the host. The updater is therefore a privileged component: anyone who can drive its API can run containers as root on the host. Only this container mounts the socket. It has no published port, and it requires the bearer token. The container runs as the non-root `node` user and reaches the socket through `group_add` (`OFFGRID_DOCKER_GID`). Do not mount the socket into any other service.
>
> The API listens on the internal Compose network without TLS. The bearer token is the only barrier between any container on that network and this privilege.

## Release source

The manifest is `release-manifest.json` on the GitHub release (ADR 0032). The updater calls `api.github.com` for the release, downloads the asset through the API, and follows one redirect to `release-assets.githubusercontent.com`. Any other host is refused. When `OFFGRID_UPDATER_RELEASE_API_BASE_URL` (https) is set, the release lookup, the asset download and any redirect are allowed only for the host of that URL instead. When `OFFGRID_UPDATER_IMAGE_REGISTRY` (`host[:port]`) is set, images are pulled from that registry instead of `ghcr.io`, and the manifest and status keep the `ghcr.io` references. Both settings are empty by default and exist for the end-to-end suite (ADR 0032, amendment OG-175). The manifest is validated with `releaseManifestSchema`, and its version must match the requested version. The manifest is not signed; digest pinning is the trust mechanism (ADR 0032).

## Run

- Process: `OFFGRID_UPDATER_TOKEN_FILE=... OFFGRID_UPDATER_RELEASE_REPOSITORY=owner/name node --import tsx src/main.ts`.
- Container: `docker build -f apps/updater/Dockerfile --target runtime -t offgrid-updater .` The image carries `pg_dump` and `pg_restore` 17.

## Backups

`createBackup` writes one folder per backup into the backup root:

- `offgrid-<version>-<UTC timestamp>/database.dump`: a `pg_dump --format=custom` dump of the `offgrid` database, taken as `offgrid_migrator`. The dump must pass `pg_restore --list` before the backup counts.
- `offgrid-<version>-<UTC timestamp>/secrets/`: a copy of the secrets directory, files mode `0600`.

Folders are created with mode `0700`. A failed backup removes its partial folder and prunes nothing. After a successful backup only the newest `OFFGRID_UPDATER_BACKUP_RETENTION` backups are kept, ordered by the timestamp in the name.

The updater needs `pg_dump` and `pg_restore` version 17 on its PATH (the container image installs them). The password is passed to the tools through `PGPASSWORD`, never on the command line. The tools get no other environment variable than `PATH` and `PGPASSWORD`.

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

`applyUpdate(dependencies, request)` runs one update. The caller passes the running version and the parsed release manifest as `unknown`; the updater validates both with zod. The Docker runner, the backup service, the status store and the health probes are injected, so the state machine itself does not touch the Docker socket or the network. `src/create-updater-services.ts` wires the real dependencies.

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

- If the updater process dies during an update, the status stays `in_progress`. The lock is in memory, so a restarted updater accepts a new run while the status still reads `in_progress`. `GET /status` reports `running: false` in that case, so the server can show the run as interrupted and allow a new apply.
- A rolled-back or replaced container stays as `<name>-replaced`, stopped, until the next update replaces it. Compose may report it as an extra container of the service.
- `failed_needs_admin` means the database and the containers may not match the previous version. Restore by hand: stop the containers, restore the database as described in the Restore section, then start the previous images from the status file.
