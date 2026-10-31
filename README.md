# Offgrid

A privacy-first, family-oriented, self-hosted app suite. The current scope is the local server only: one server process and one database, running on your own machine. Nothing is sent to a cloud service, and there is no telemetry.

## Status

Early development. The stack starts, the database and module schemas are set up, and the first reference module (`family`) can create families and list them. The other feature modules in [modules/](modules/README.md) are still stubs. Cloud, gateway, billing and tunnel features are future work and do not exist yet.

## Install

### Prerequisites

- Docker Engine with the Compose v2 plugin (`docker compose version` must work).
- About 2 GB of free disk space for images and the database.

### One command

From the repository root:

```bash
docker compose -f infra/compose/docker-compose.yml up -d --wait
```

The first run builds the images, generates the secrets, creates the database and runs the migration job. Later runs keep your data and secrets. The migration job applies migrations for the modules the server registers; none are registered yet, so it currently applies nothing.

Open the web app at `http://localhost:8080`. The API listens on port 3000 of the same host. Both ports listen on all network interfaces.

To open the web app from another device, set `OFFGRID_CORS_ORIGINS` to the origin that device uses, for example `http://192.168.1.20:8080`, in `infra/compose/.env` and restart the stack. The server accepts browser requests only from the origins listed there.

### Where data and secrets live

- `data/secrets/` (in the repository root, git-ignored): the database passwords and the instance id. Files are created once and never regenerated. Keep this folder safe: losing it means losing access to the database. The files are readable by any user on this machine, so keep the host account itself locked down.
- The `offgrid-db` Docker volume: the PostgreSQL data.
  Upgrading from a stack that used Caddy: the `caddy-data` and `caddy-config` volumes are no longer used. Remove them with `docker volume rm` once the new stack runs.

Optional settings (`OFFGRID_WEB_PORT`, `OFFGRID_SERVER_PORT`, `OFFGRID_CORS_ORIGINS`, `OFFGRID_API_ORIGIN`, `TZ`, `OFFGRID_VERSION`) can be set in `infra/compose/.env`. The defaults work unchanged. To start from the placeholders, copy the repository-root `.env.example` to `infra/compose/.env`.

The published ports listen on all network interfaces, so other devices on your network can reach the instance.

### Back up

Write the backups outside the repository, so that they are never committed. Replace `<backup-dir>` with a folder such as `$HOME/offgrid-backup`:

```bash
docker compose -f infra/compose/docker-compose.yml exec -T db pg_dump -U postgres offgrid > <backup-dir>/offgrid.sql
cp -a data <backup-dir>/data
```

Store both outputs somewhere safe. The dump holds your data and the copy holds your secrets.

### Stop

```bash
docker compose -f infra/compose/docker-compose.yml down
```

This stops the containers and keeps the volumes and `data/`. Add `-v` only if you want to delete the database as well.

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

## Documentation

- [Architecture overview](docs/architecture/overview.md): how the server, modules, database and web app fit together.
- [Module boundaries](docs/architecture/boundaries.md): the rules that `pnpm check:boundaries` enforces.
- [Glossary](docs/glossary.md): the terms used in the code and in these docs.
- [Privacy statement](docs/privacy.md): what the local server stores, where, and what it never sends out.
- [Architecture decision records](docs/adr/README.md): why things are the way they are.
- [CONTRIBUTING.md](CONTRIBUTING.md): how to contribute, including the DCO sign-off.
