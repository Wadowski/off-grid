# Offgrid

A privacy-first, family-oriented, self-hosted app suite. The current scope is the local server only.

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
