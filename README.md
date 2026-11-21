# Offgrid

A privacy-first, family-oriented, self-hosted app suite. The current scope is the local server only: one server process and one database, running on your own machine. At runtime nothing is sent to a cloud service, and there is no telemetry.

## Status

Early development. The stack starts, the database and module schemas are set up, and the `family` reference module has create and list routes. The shipped server has no sign-in yet: the identity module is an empty stub, so every request is anonymous and user-scoped routes return `UNAUTHENTICATED`. The family routes are exercised in tests with an injected identity. The other feature modules in [modules/](modules/README.md) are still stubs. Cloud, gateway, billing and tunnel features are future work and do not exist yet.

## Install

Offgrid runs as Docker containers on one host that you control. The production install runs the published release images. Choose one of the two options. Both need:

- Docker Engine with the Compose v2 plugin, version 2.23 or newer (`docker compose version` must work). Option 1 installs it on supported Linux systems.
- About 2 GB of free disk space for the images and the database.
- A host on a network you trust. The web app and the API listen on all network interfaces, so other devices on that network can reach them (see [who can reach it](docs/privacy.md#who-can-reach-it)).

### Option 1: install script (Linux)

The install script installs Docker if it is missing, downloads the production Compose file and starts the stack. It supports RHEL, CentOS Stream, Fedora, Debian and Ubuntu on amd64 and arm64. Other systems: use option 2.

The script runs as root, so read it before you run it. Replace `X.Y.Z` with the release you want, from the [releases page](https://github.com/Wadowski/off-grid/releases):

```bash
VERSION=X.Y.Z
BASE_URL="https://github.com/Wadowski/off-grid/releases/download/v${VERSION}"
curl -fsSLO --proto '=https' --tlsv1.2 "${BASE_URL}/install.sh"
curl -fsSLO --proto '=https' --tlsv1.2 "${BASE_URL}/SHA256SUMS"
sha256sum -c --ignore-missing SHA256SUMS
less install.sh
sudo env OFFGRID_VERSION="${VERSION}" sh install.sh
```

The `sha256sum` line must print `install.sh: OK`. `SHA256SUMS` comes from the same release as the script, so the check catches a corrupted or swapped download. It does not protect against a compromised release, because the release manifest and checksums are not signed yet ([ADR 0032](docs/adr/0032-outbound-update-check-and-image-pull.md)). The URLs in this option work only for releases that attach `install.sh` (the next tag onward). For earlier releases, see [infra/README.md](infra/README.md).

The script:

- checks that it runs as root, the CPU architecture, the operating system and that at least 2 GB is free in the install folder;
- installs Docker Engine and the Compose plugin from the official Docker repository when Docker is missing, after checking the repository key against a pinned fingerprint;
- downloads `docker-compose.production.yml`, `production.env.example` and `SHA256SUMS` from the release, checks the two files against `SHA256SUMS`, and stops before anything is installed on a mismatch;
- creates `.env` from `production.env.example` only when `.env` does not exist, pinned to the release version. It never overwrites an existing `.env`;
- pulls the images and starts the stack with `docker compose up -d --wait`, waiting up to 5 minutes;
- never creates, reads or changes secrets. The stack generates them into the `offgrid-secrets` volume on first start.

The files go to `/opt/offgrid`. To use another folder, set `OFFGRID_INSTALL_DIR` to an absolute path, for example `sudo env OFFGRID_INSTALL_DIR=/srv/offgrid OFFGRID_VERSION="${VERSION}" sh install.sh`.

Running the script again is safe. With the same version it pulls and restarts nothing, and it keeps `.env` and the secrets. A newer version updates the pin, pulls the images and restarts the stack. An older version is refused, because a downgrade can break a migrated database. When the pin in `.env` is older than the installed version, for example after an update from the app, the script corrects only the `OFFGRID_VERSION` line.

If the user who ran `sudo` is not in the `docker` group, the script prints the `usermod` command to run. It does not change group membership itself.

When the script finishes, it prints the address to open. Continue with [First start](#first-start).

> **Verification status:** the Docker install branch is tested in containers (`pnpm test:install-distros`). A full run of this option on a clean virtual machine is **not run** yet.

### Option 2: paste-in Compose file

Use this option on hosts the script does not support, such as Rocky Linux or AlmaLinux, or when you want to run the Compose file yourself. Install Docker Engine with Compose 2.23 or newer first. Then:

```bash
sudo mkdir -p /opt/offgrid && sudo chown "$USER" /opt/offgrid && cd /opt/offgrid

VERSION=X.Y.Z
BASE_URL="https://github.com/Wadowski/off-grid/releases/download/v${VERSION}"
curl -fsSLO --proto '=https' --tlsv1.2 "${BASE_URL}/docker-compose.production.yml"
curl -fsSLO --proto '=https' --tlsv1.2 "${BASE_URL}/production.env.example"
curl -fsSLO --proto '=https' --tlsv1.2 "${BASE_URL}/SHA256SUMS"
sha256sum -c --ignore-missing SHA256SUMS

install -m 600 production.env.example .env
sed -i "s/^OFFGRID_VERSION=.*/OFFGRID_VERSION=${VERSION}/" .env

docker compose --env-file .env -f docker-compose.production.yml up -d --wait
```

Every line that `sha256sum` prints must end in `OK`. Set `OFFGRID_VERSION` in `.env` to the version you installed. Compose refuses to start without it, and the `latest` tag is never used. Keep the file pinned to the installed version: after an update from the app the value goes stale, see [Updating](#updating). The URLs in this option work only for releases that attach `install.sh` (the next tag onward). For earlier releases, see [infra/README.md](infra/README.md).

Do not copy over an existing `.env`. Edit it instead.

**Docker Desktop (macOS and Windows): not tested.** The Compose file works with Docker Desktop's Compose plugin, but the updater needs the Docker socket. Set `OFFGRID_DOCKER_SOCKET_PATH` in `.env` to the socket path on your machine, and `OFFGRID_DOCKER_GID` to the group id that can use it (`0` is the default). Check that the updater starts with `docker compose logs updater`. If it does not, in-app updates do not work on that host until the socket is set up correctly. The socket path and group id have not been verified on Docker Desktop.

### First start

1. Open `http://<host>:8080` in a browser on the host. The port is `OFFGRID_WEB_PORT`. The API listens on port 3000 of the same host (`OFFGRID_SERVER_PORT`).
2. Create the admin account. The first account becomes the admin.
3. To open the web app from another device, set `OFFGRID_CORS_ORIGINS` in `.env` to the origin that device uses, for example `http://192.168.1.20:8080`. Then run `docker compose --env-file .env -f docker-compose.production.yml up -d` in the install folder. The server accepts browser requests only from the listed origins. This is a browser rule, not an access control: it does not stop other clients.

The settings in `.env` are `OFFGRID_VERSION`, `OFFGRID_IMAGE_OWNER`, `OFFGRID_RELEASE_REPOSITORY`, `OFFGRID_WEB_PORT`, `OFFGRID_SERVER_PORT`, `OFFGRID_CORS_ORIGINS`, `OFFGRID_DOCKER_GID`, `OFFGRID_DOCKER_SOCKET_PATH` and `TZ`. The defaults work unchanged on a Linux host.

## Updating

Updates run from the app. Only an admin can start one. Nothing contacts GitHub until an admin asks, or until the nightly option is on.

1. Sign in as the admin and open **Settings**, then **Software update**. The page shows the running version, the latest version and when the check last ran. The running version is also returned by `GET /api/system/version`, which needs no sign-in.
2. Choose **Check for updates**. This asks GitHub for the latest release. Together with **Update system**, it is one of the two outbound actions an admin can trigger (see [privacy](docs/privacy.md#what-it-does-not-do)).
3. If a newer version exists, choose **Update system**. A dialog asks **Update to X.Y.Z?**. It says that the database is backed up first and that the system goes back to the current version if the update fails. Confirm with **Update now**.
4. The page shows the steps as they run: checking the version, backing up the database, downloading the new version, updating the database, starting the new version and checking that it works. The system restarts, so you may be signed out for a moment. When it is done, the page says **Updated to version X.Y.Z. Reload this page to use the new version.**

What the updater does, in order: it checks that the new version is allowed, backs up the database and the secrets into the `offgrid-backups` volume (the newest 3 backups are kept), pulls the new images by their digest, runs the database migrations, replaces the server and web containers, and checks their health. If the migration, the replacement or the health check fails, it rolls back to the previous images and restores the database from that backup. The details are in [apps/updater/README.md](apps/updater/README.md).

**Nightly update.** Under **Software update**, the option **Update automatically every night** checks once a day and updates when a newer version exists. It is off by default. The check runs at 03:30 in the time zone set by `TZ` in `.env`. When the option is off, the updater makes no call to GitHub.

**Keep `OFFGRID_VERSION` in `.env` in step.** An update from the app changes the running images, but not the `OFFGRID_VERSION` line in `.env`. That line goes stale. Running `docker compose up` with an older value would downgrade the containers against a migrated database. After an update, either set `OFFGRID_VERSION` in `.env` to the installed version by hand, or re-run the install script without `OFFGRID_VERSION`: it reads the installed version, corrects the pin and does not pull or restart anything.

## Backup and restore

Update backups are made automatically before each update and stored in the `offgrid_offgrid-backups` volume. Each backup is a folder named `offgrid-<version>-<UTC time>` with `database.dump` and a `secrets/` folder. The updater creates the folders with mode `0700`, and the files in them are private to the updater.

Two things hold your data and must be backed up: the database and the secrets. Uploaded files are added when the files module ships, and then they must be backed up too. Keep the backups off the host as well, because they hold secrets in plain text.

Manual backup. The commands run in the install folder, where `docker-compose.production.yml` and `.env` are. The backup folder is named after the UTC time it was taken:

```bash
cd /opt/offgrid
umask 077
BACKUP_DIR="$HOME/offgrid-backup/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$BACKUP_DIR" && chmod 700 "$BACKUP_DIR"

docker compose -f docker-compose.production.yml stop server
docker compose -f docker-compose.production.yml exec -T db pg_dump -U postgres --format=custom offgrid > "$BACKUP_DIR/database.dump"
docker run --rm -v offgrid_offgrid-secrets:/src:ro -v "$BACKUP_DIR":/dst:Z alpine sh -c "mkdir /dst/secrets && cp -R /src/. /dst/secrets/ && chown -R $(id -u):$(id -g) /dst/secrets"
docker run --rm -v offgrid_offgrid-files:/src:ro -v "$BACKUP_DIR":/dst:Z alpine sh -c "mkdir /dst/files && cp -R /src/. /dst/files/ && chown -R $(id -u):$(id -g) /dst/files"
docker compose -f docker-compose.production.yml start server
```

The server is stopped only while the dump and the copies are taken, so the file names in the database match the files on disk. If a command fails, run `docker compose -f docker-compose.production.yml start server` before you look at the error. The volume names have the prefix `offgrid_`, the Compose project name. Check them with `docker volume ls`.

Restore the database. The server must be stopped, so that no connection holds the database. Restore into the database the stack already has, from a folder that holds `database.dump`:

```bash
cd /opt/offgrid
BACKUP_DIR="$HOME/offgrid-backup/<folder>"

docker compose -f docker-compose.production.yml stop server web
docker compose -f docker-compose.production.yml exec -T db sh -c 'export PGPASSWORD="$(cat /run/secrets/migrator-password)"; exec pg_restore --clean --if-exists --single-transaction --exit-on-error --host 127.0.0.1 --username offgrid_migrator --dbname offgrid' < "$BACKUP_DIR/database.dump"
docker compose -f docker-compose.production.yml start server web
```

The restore runs as the migrator role, not as a superuser, so the restored tables keep their owner. It runs in one transaction: if it fails, the database stays as it was. The password is read inside the container and never printed. Check that the server is healthy with `docker compose -f docker-compose.production.yml ps`.

To restore a backup from the `offgrid_offgrid-backups` volume, first copy its folder to the host, then use the commands above with that folder:

```bash
mkdir -p "$HOME/offgrid-backup"
docker run --rm -v offgrid_offgrid-backups:/src:ro -v "$HOME/offgrid-backup":/dst:Z alpine sh -c "cp -R /src/<folder> /dst/"
```

Secrets are never restored by these commands. Restoring a secret by hand is only safe together with the database from the same backup, because the secrets must match the data they encrypt or sign. See [apps/updater/README.md](apps/updater/README.md#restore).

## Recovery

**The update failed and the system went back to the previous version.** The updater restored the previous images and the database from the backup it took before the update. Every change made after that backup is lost, and the page says **Changes made after the backup were lost.** Sign in again and check the version under **Software update**. Then check the stack with `docker compose -f docker-compose.production.yml ps`.

**The last update was interrupted.** The updater stopped while an update was running, for example because the host restarted. Check that the server and web containers are running and that the app opens. If they do, run **Check for updates** again. If they do not, follow the steps for a failed update below.

**The update failed and the system needs your help.** The rollback failed at one step, so the database and the containers may not match the previous version. Stop the stack, restore the database from the backup named in the status file, and start the previous version.

```bash
cd /opt/offgrid
docker run --rm -v offgrid_offgrid-updater-state:/state:ro alpine cat /state/status.json
```

The status file holds the `currentVersion` (the previous version), `backupName` (the backup folder), `failedStep` and `previousImages`. Copy the `backupName` folder from `offgrid_offgrid-backups` to the host as shown in [Backup and restore](#backup-and-restore), then:

```bash
docker compose -f docker-compose.production.yml stop server web updater
# restore the database from that folder, as shown in Backup and restore
# then set OFFGRID_VERSION in .env to currentVersion, and start the stack:
docker compose -f docker-compose.production.yml up -d --wait
```

The status file lists the exact image references in `previousImages`. If the release for `currentVersion` cannot be pulled, use those references instead. Containers that the updater replaced stay as `<name>-replaced`. After the stack is healthy, remove them with `docker rm` after checking the names with `docker ps -a`. Details are in [apps/updater/README.md](apps/updater/README.md#apply-an-update).

**Recover the admin.** If the admin cannot sign in, run this on the server host. It creates a one-time reset code for the admin account. Give the code to the admin in person; it is shown once and expires after 24 hours:

```bash
cd /opt/offgrid
docker compose -f docker-compose.production.yml exec server node --import tsx src/recover-admin.ts reset-password --email <admin-email>
```

If no active admin exists at all, create one. The command refuses while an active admin exists:

```bash
docker compose -f docker-compose.production.yml exec server node --import tsx src/recover-admin.ts create-admin --email <admin-email> --name "<display name>"
```

**Stop the stack.** This stops the containers and keeps the volumes:

```bash
cd /opt/offgrid
docker compose -f docker-compose.production.yml down
```

Add `-v` only if you want to delete the database and all volumes. That deletes your data.

### Outgoing email

Email is optional. Offgrid uses it for emailed recovery codes and for notices about account changes. Until you set it up, the app works without email.

You need an email address that sends mail through Gmail, iCloud or Fastmail, and an app password for it. An app password is a separate password that a provider issues for one application, so Offgrid never sees your real password.

- **Gmail:** turn on 2-Step Verification in your Google Account under Security. Then open Security, App passwords, create one named Offgrid, and copy the 16-character password.
- **iCloud:** sign in at appleid.apple.com, open Sign-In and Security, choose App-Specific Passwords, and create one named Offgrid.
- **Fastmail:** open Settings, Privacy & Security, Integrations, and create a new app password with Mail (SMTP) access.

Outlook.com is not supported yet, because Microsoft is moving SMTP to a sign-in method that Offgrid does not have yet.

For any other mail server, enter its host, port and security (STARTTLS, TLS or none) and the username it expects.

Save the settings as the admin, then send a test email. A failed test says why: the provider did not accept the password, the server cannot be reached, or the message was refused.

## Develop

Requirements: Node.js 24.22.1 or newer and pnpm. This repository uses `pnpm` only; do not use npm or yarn.

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm lint
pnpm test
```

`pnpm test` runs the unit and integration tests of every package and the repository scripts. The integration tests start their own throwaway Postgres in a container, so Docker must be running. The end-to-end suite runs with `pnpm e2e` (smoke tests: `pnpm e2e:smoke`). Its global setup starts the compose stack for the run.

To run the full set of checks that CI runs, see [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/ci.md](docs/ci.md).

### Build the stack from source (developer use)

This section is for developers. It builds the images from this repository and keeps its data in the repository's `data/` folder. It is not the install path for a host that runs Offgrid. For that, see [Install](#install).

Run these commands from the repository root:

```bash
docker compose -f infra/compose/docker-compose.yml up -d --wait
```

The first run builds the images, generates the secrets, creates the database and runs the migration job. Later runs keep your data and secrets. The first build needs internet access: it pulls base images and installs npm packages. After the stack is running, it makes no outbound calls, except outgoing mail that you turn on and web push that you subscribe a browser to (see the [privacy statement](docs/privacy.md)).

The open addresses are the same as in production: `http://localhost:8080` for the web app and port 3000 for the API. Both ports listen on all network interfaces.

Data and secrets in this mode:

- `data/secrets/` (in the repository root, git-ignored): the database passwords and the instance id. Files are created once and never regenerated. Keep this folder safe: losing it means losing access to the database. The files are readable by any user on this machine, so keep the host account itself locked down.
- `data/files/` (once the files module ships, in the repository root, git-ignored): the bytes of files you upload. The names you give files are in the database, not here.
- The `offgrid-db` Docker volume: the PostgreSQL data.

If you ran an earlier stack that used Caddy, its `caddy-data` and `caddy-config` volumes are no longer used. Remove them with `docker volume rm` once the new stack runs.

Optional settings (`OFFGRID_WEB_PORT`, `OFFGRID_SERVER_PORT`, `OFFGRID_CORS_ORIGINS`, `OFFGRID_API_ORIGIN`, `TZ`, `OFFGRID_VERSION`) can be set in `infra/compose/.env`. The defaults work unchanged. To start from the placeholders, copy the repository-root `.env.example` to `infra/compose/.env`.

Back up (developer use). Write the backups outside the repository, so that they are never committed. Replace `<backup-dir>` with a folder such as `$HOME/offgrid-backup`:

```bash
docker compose -f infra/compose/docker-compose.yml exec -T db pg_dump -U postgres offgrid > <backup-dir>/offgrid.sql
cp -a data <backup-dir>/data
```

Store both outputs somewhere safe. The dump holds your data and the copy holds your secrets. Once the files module ships, `data/files` holds uploaded file bytes and the `cp -a data` line copies it too. Take the dump and the copy while the server is stopped, so that the file names in the dump match the bytes in the copy. Stop only the server, keep the database running for `pg_dump`, and start the server again afterwards:

```bash
docker compose -f infra/compose/docker-compose.yml stop server
# run the dump and copy commands above, then:
docker compose -f infra/compose/docker-compose.yml start server
```

Stop (developer use). This stops the containers and keeps the volumes and `data/`. Add `-v` only if you want to delete the database as well:

```bash
docker compose -f infra/compose/docker-compose.yml down
```

Recover the admin (developer use). Run this on the host. It creates a one-time reset code for the admin account. Give the code to the admin in person; it is shown once and expires after 24 hours:

```bash
docker compose -f infra/compose/docker-compose.yml exec server node --import tsx src/recover-admin.ts reset-password --email <admin-email>
```

If no active admin exists at all, create one. The command refuses while an active admin exists:

```bash
docker compose -f infra/compose/docker-compose.yml exec server node --import tsx src/recover-admin.ts create-admin --email <admin-email> --name "<display name>"
```

## Documentation

- [Architecture overview](docs/architecture/overview.md): how the server, modules, database and web app fit together.
- [Module boundaries](docs/architecture/boundaries.md): the rules that `pnpm check:boundaries` enforces.
- [Glossary](docs/glossary.md): the terms used in the code and in these docs.
- [Privacy statement](docs/privacy.md): what the local server stores, where, and what it never sends out.
- [Infrastructure](infra/README.md): the two Compose files, the install script and the install folder layout.
- [Updater](apps/updater/README.md): how updates, backups and rollbacks work.
- [Architecture decision records](docs/adr/README.md): why things are the way they are.
- [CONTRIBUTING.md](CONTRIBUTING.md): how to contribute, including the DCO sign-off.
