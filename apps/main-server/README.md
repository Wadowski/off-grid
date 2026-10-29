# @offgrid/main-server

Purpose: composition root: wires modules into the single Fastify server process.
Public API: only what `src/index.ts` exports (`startServer`, `loadConfig`); never import from `src/` internals.
Owner: platform team

## Configuration

Read from the environment and validated with zod at startup. Missing or invalid values fail fast and name the variable.

| Variable                         | Default      | Notes                                                                                                |
| -------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------- |
| `OFFGRID_HTTP_HOST`              | `0.0.0.0`    | Internal bind address                                                                                |
| `OFFGRID_HTTP_PORT`              | `3000`       | Only port the server exposes                                                                         |
| `OFFGRID_DATABASE_HOST`          | required     | Postgres host                                                                                        |
| `OFFGRID_DATABASE_PORT`          | `5432`       |                                                                                                      |
| `OFFGRID_DATABASE_NAME`          | required     |                                                                                                      |
| `OFFGRID_DATABASE_USER`          | `outbox_app` | Login the server pool uses; must be a member of the module app roles                                 |
| `OFFGRID_DATABASE_PASSWORD_FILE` | required     | Path to a file holding the password (secrets come from files only)                                   |
| `OFFGRID_DATABASE_POOL_MAX`      | `10`         |                                                                                                      |
| `OFFGRID_DEV_IDENTITY`           | `false`      | Enables the `x-offgrid-user-id`, `x-offgrid-family-id` and `x-offgrid-access-group-ids` stub headers |
| `OFFGRID_RATE_LIMIT_PER_MINUTE`  | `300`        | Per client IP                                                                                        |
| `OFFGRID_LOG_LEVEL`              | `info`       | `debug`, `info`, `warn` or `error`                                                                   |

## Endpoints

All under `/api`:

- `GET /api/health`: process is up.
- `GET /api/health/ready`: database answers, publisher is running and migrations are applied. Returns 503 with per-check status otherwise.

## Modules

Modules are listed explicitly in `src/module-list.ts`. A module exports a descriptor with `name`, optional `migrations`, `registerRoutes`, `registerSubscribers` and `workers`. The server validates names and rejects duplicates at startup.
