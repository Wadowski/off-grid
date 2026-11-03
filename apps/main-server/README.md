# @offgrid/main-server

Purpose: composition root: wires modules into the single Fastify server process.
Public API: only what `src/index.ts` exports (`startServer`, `loadConfig`); never import from `src/` internals.
Owner: platform team

## Source layout

`src/` keeps only the entry points (`main.ts`, `migrate.ts`, `recover-admin.ts`, `index.ts`) and the single `types.ts` and `constants.ts`. Everything else is grouped into feature folders, with a kind-based subfolder (`errors/`, `headers/`) inside a large feature. Tests sit beside the file they test.

| Folder              | Holds                                                                    |
| ------------------- | ------------------------------------------------------------------------ |
| `config/`           | Reading and validating environment configuration and secrets.            |
| `lifecycle/`        | Creating the runtime, starting the server, shutting down, fatal startup. |
| `module-wiring/`    | Validating module descriptors, per-module context and database, workers. |
| `http/`             | Building the Fastify app: routes, hooks, error handling.                 |
| `http/errors/`      | `ApiError` and the helpers that turn an error into a status and a body.  |
| `http/headers/`     | Header parsing helpers.                                                  |
| `request-identity/` | Turning a bearer token and family header into the request context.       |
| `readiness/`        | The `/api/health/ready` checks.                                          |
| `migrations/`       | Loading expected migrations and running the migrate command.             |
| `recovery/`         | The `recover-admin` command.                                             |

Startup order: `config/` loads the configuration, `lifecycle/` creates the runtime, `module-wiring/` validates and registers modules, `http/` builds the app, and `lifecycle/` starts listening and workers.

## Configuration

Read from the environment and validated with zod at startup. Missing or invalid values fail fast and name the variable.

| Variable                         | Default       | Notes                                                                                                                                                                                               |
| -------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OFFGRID_HTTP_HOST`              | `127.0.0.1`   | Bind address.                                                                                                                                                                                       |
| `OFFGRID_HTTP_PORT`              | `3000`        | Only port the server exposes                                                                                                                                                                        |
| `OFFGRID_DATABASE_HOST`          | required      | Postgres host                                                                                                                                                                                       |
| `OFFGRID_DATABASE_PORT`          | `5432`        |                                                                                                                                                                                                     |
| `OFFGRID_DATABASE_NAME`          | required      |                                                                                                                                                                                                     |
| `OFFGRID_DATABASE_USER`          | `offgrid_app` | Runtime login for every module and the event bus. Migrations run as `offgrid_migrator` (ADR 0017).                                                                                                  |
| `OFFGRID_DATABASE_PASSWORD_FILE` | required      | Path to a file holding the password (secrets come from files only)                                                                                                                                  |
| `OFFGRID_DATABASE_POOL_MAX`      | `10`          |                                                                                                                                                                                                     |
| `OFFGRID_TRUSTED_PROXIES`        | empty         | Comma-separated proxy addresses or subnets whose `X-Forwarded-For` header is trusted for the client IP. Empty trusts no proxy, so behind a proxy every client shares its address for the rate limit |
| `OFFGRID_RATE_LIMIT_PER_MINUTE`  | `300`         | Per client IP                                                                                                                                                                                       |
| `OFFGRID_LOG_LEVEL`              | `info`        | `debug`, `info`, `warn` or `error`                                                                                                                                                                  |

## Endpoints

All under `/api`:

- `GET /api/health`: process is up.
- `GET /api/health/ready`: database answers, publisher is running and migrations are applied. Returns 503 with per-check status otherwise.

## Modules

Modules are listed explicitly in `MODULES` in `src/constants.ts`. A module exports a descriptor with `name`, `registerRoutes`, `registerSubscribers` and `workers`. The server validates names and rejects duplicates at startup.
