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

The first run builds the images, generates the secrets, creates the database and applies migrations. Later runs keep your data and secrets.

Open the instance at `https://localhost` (accept the local certificate, which Caddy issues from its internal CA). Port 80 redirects to 443.

### Where data and secrets live

- `data/secrets/` (in the repository root, git-ignored): the database passwords and the instance id. Files are created once and never regenerated. Keep this folder safe: losing it means losing access to the database.
- The `offgrid-db` Docker volume: the PostgreSQL data.
- The `caddy-data` Docker volume: the local certificate authority.

Optional settings (`HTTP_PORT`, `HTTPS_PORT`, `TZ`, `OFFGRID_VERSION`) can be set in `infra/compose/.env`. The defaults work unchanged. Copy the placeholders from `.env.example`.

### Back up

```bash
docker compose -f infra/compose/docker-compose.yml exec db pg_dump -U postgres offgrid > offgrid-backup.sql
cp -a data offgrid-data-backup
```

Store both files somewhere safe. The dump holds your data and the copy holds your secrets.

### Stop

```bash
docker compose -f infra/compose/docker-compose.yml down
```

This stops the containers and keeps the volumes and `data/`. Add `-v` only if you want to delete the database as well.
