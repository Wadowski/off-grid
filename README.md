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

The `sha256sum` line must print `install.sh: OK`. `SHA256SUMS` comes from the same release as the script, so the check catches a corrupted or swapped download. It does not protect against a compromised release, because the release manifest and checksums are not signed yet ([ADR 0032](docs/adr/0032-outbound-update-check-and-image-pull.md)).

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

cp production.env.example .env
chmod 600 .env
sed -i "s/^OFFGRID_VERSION=.*/OFFGRID_VERSION=${VERSION}/" .env

docker compose --env-file .env -f docker-compose.production.yml up -d --wait
```

Both `sha256sum` results must print `OK`. Set `OFFGRID_VERSION` in `.env` to the version you installed. Compose refuses to start without it, and the `latest` tag is never used. Keep the file pinned to the installed version: after an update from the app the value goes stale, see [Updating](#updating).

Do not copy over an existing `.env`. Edit it instead.

**Docker Desktop (macOS and Windows): not tested.** The Compose file works with Docker Desktop's Compose plugin, but the updater needs the Docker socket. Set `OFFGRID_DOCKER_SOCKET_PATH` in `.env` to the socket path on your machine, and `OFFGRID_DOCKER_GID` to the group id that can use it (`0` is the default). Check that the updater starts with `docker compose logs updater`. If it does not, in-app updates do not work on that host until the socket is set up correctly. The socket path and group id have not been verified on Docker Desktop.

### First start

1. Open `http://<host>:8080` in a browser on the host. The port is `OFFGRID_WEB_PORT`. The API listens on port 3000 of the same host (`OFFGRID_SERVER_PORT`).
2. Create the admin account. The first account becomes the admin.
3. To open the web app from another device, set `OFFGRID_CORS_ORIGINS` in `.env` to the origin that device uses, for example `http://192.168.1.20:8080`. Then run `docker compose --env-file .env -f docker-compose.production.yml up -d` in the install folder. The server accepts browser requests only from the listed origins. This is a browser rule, not an access control: it does not stop other clients.

The settings in `.env` are `OFFGRID_VERSION`, `OFFGRID_IMAGE_OWNER`, `OFFGRID_RELEASE_REPOSITORY`, `OFFGRID_WEB_PORT`, `OFFGRID_SERVER_PORT`, `OFFGRID_CORS_ORIGINS`, `OFFGRID_DOCKER_GID`, `OFFGRID_DOCKER_SOCKET_PATH` and `TZ`. The defaults work unchanged on a Linux host.

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
