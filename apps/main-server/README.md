# @offgrid/main-server

Purpose: composition root: wires modules into the single Fastify server process.
Public API: only what `src/index.ts` exports (`startServer`, `loadConfig`); never import from `src/` internals.
Owner: platform team

## Configuration

Read from the environment and validated with zod at startup. Missing or invalid values fail fast and name the variable.

| Variable                         | Default      | Notes                                                                                                                                                                                               |
| -------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OFFGRID_HTTP_HOST`              | `127.0.0.1`  | Bind address.                                                                                                                                                                                       |
| `OFFGRID_HTTP_PORT`              | `3000`       | Only port the server exposes                                                                                                                                                                        |
| `OFFGRID_DATABASE_HOST`          | required     | Postgres host                                                                                                                                                                                       |
| `OFFGRID_DATABASE_PORT`          | `5432`       |                                                                                                                                                                                                     |
| `OFFGRID_DATABASE_NAME`          | required     |                                                                                                                                                                                                     |
| `OFFGRID_DATABASE_USER`          | `outbox_app` | Login the event bus pool uses; must be a member of the module app roles. Modules connect with their own `<m>_app` login                                                                             |
| `OFFGRID_DATABASE_PASSWORD_FILE` | required     | Path to a file holding the password (secrets come from files only)                                                                                                                                  |
| `OFFGRID_DATABASE_POOL_MAX`      | `10`         |                                                                                                                                                                                                     |
| `OFFGRID_TRUSTED_PROXIES`        | empty        | Comma-separated proxy addresses or subnets whose `X-Forwarded-For` header is trusted for the client IP. Empty trusts no proxy, so behind a proxy every client shares its address for the rate limit |
| `OFFGRID_RATE_LIMIT_PER_MINUTE`  | `300`        | Per client IP                                                                                                                                                                                       |
| `OFFGRID_LOG_LEVEL`              | `info`       | `debug`, `info`, `warn` or `error`                                                                                                                                                                  |

## Endpoints

All under `/api`:

- `GET /api/health`: process is up.
- `GET /api/health/ready`: database answers, publisher is running and migrations are applied. Returns 503 with per-check status otherwise.

## Modules

Modules are listed explicitly in `MODULES` in `src/constants.ts`. A module exports a descriptor with `name`, optional `migrations`, `registerRoutes`, `registerSubscribers` and `workers`. The server validates names and rejects duplicates at startup.
