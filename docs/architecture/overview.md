# Architecture overview

Offgrid is a self-hosted app suite. It runs as one server process with one Postgres database on the user's own machine. This page describes how the parts fit together and where each concern lives. The decisions behind it are in the [architecture decision records](../adr/README.md).

## Shape of the system

- **Modular monolith** ([ADR 0006](../adr/0006-modular-monolith.md)). One server process (`apps/main-server`) loads every feature module in `modules/`. Modules are separate in code and in the database, but they are deployed together.
- **One Postgres database** ([ADR 0009](../adr/0009-table-ownership-scopes.md)). Each module owns one schema, for example `family`. Each module has its own database roles, and it touches only its own schema.
- **Events, not calls** ([ADR 0002](../adr/0002-outbox-events-and-projections.md), [ADR 0010](../adr/0010-pluggable-event-transport.md)). A module that changes data writes a versioned event to the `outbox` schema in the same transaction as the change. Other modules react to that event through their own subscribers, with retries and a dead-letter queue for events that keep failing.
- **Read-only projections** ([ADR 0013](../adr/0013-projections-for-other-modules-only.md)). When a module needs data from another module, it keeps its own read-only copy, built from events. It never reads another module's tables.
- **Web app and API** ([ADR 0015](../adr/0015-no-reverse-proxy-cors-on-the-server.md)). A React + Vite web app is served as static files. It calls the server's HTTP API directly, and the server accepts browser requests only from the origins it is configured with.

## Diagram

```mermaid
flowchart LR
  browser["Browser"] -->|"port 8080"| web["web<br/>(nginx, static React app)"]
  browser -->|"port 3000 /api"| server["server<br/>(one Node process)"]
  server --> db[("Postgres<br/>one database")]
  subgraph db
    outbox["outbox schema"]
    family["family schema"]
    others["one schema per other module"]
  end
  server -. "migrations" .-> migrate["init job<br/>(runs migrations once)"]
  migrate --> db
```

## Module layout

Each folder in `modules/` is one feature module (`@offgrid/<name>`). The standard layout is in [modules/README.md](../../modules/README.md), and `modules/family` is the reference implementation:

- `domain/`: pure business logic, with no I/O.
- `application/`: commands and queries (use cases).
- `infrastructure/`: repositories and migrations for the module's own schema.
- `http/`: Fastify routes.
- `events/`: events the module publishes and handles.
- `workers/`: background jobs.
- `index.ts`: the only public entry point.

`apps/main-server` wires the modules together. `packages/` holds code that every module can use: contracts, the event bus, database helpers, access control, observability, the HTTP error model, the UI kit and the API client. Packages never import from apps or modules.

The rules are enforced by `pnpm check:boundaries`. See [boundaries.md](boundaries.md).

## Request flow

1. The browser loads the web app from the `web` service on `OFFGRID_WEB_PORT` (default 8080).
2. The web app calls the API on `OFFGRID_SERVER_PORT` (default 3000), using the typed client in `packages/api-client`.
3. The server checks the request's origin against `OFFGRID_CORS_ORIGINS`, then routes it to a module's `http/` routes.
4. The module runs its use case in a database transaction. It sets the request context (user or family) so that Postgres row policies apply.
5. If the use case changed data that other modules care about, the same transaction writes an event to the outbox. Subscribers pick it up after the commit.

## Where each concern lives

| Concern                       | Where                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| Containers and first-run init | `infra/compose/` (Docker Compose), `infra/init/` (database init SQL)                                   |
| Server composition            | `apps/main-server/src/`                                                                                |
| Web app                       | `apps/main-web/`                                                                                       |
| Feature logic                 | `modules/<name>/`                                                                                      |
| Database schemas and roles    | `packages/db/` (helpers and migration runner), each module's `infrastructure/migrations`               |
| Events and subscribers        | `packages/event-bus/` (outbox, delivery, retries, dead letters), `packages/contracts/` (event schemas) |
| Access checks                 | `packages/access-control/`                                                                             |
| Logs and trace ids            | `packages/observability/`                                                                              |
| Shared API types              | `packages/contracts/` (schemas and OpenAPI), `packages/api-client/` (typed client)                     |
| End-to-end tests              | `e2e/` (Playwright-BDD, [ADR 0007](../adr/0007-e2e-playwright-bdd.md))                                 |

## Related

- [Module boundaries](boundaries.md)
- [Glossary](../glossary.md)
- [Privacy statement](../privacy.md)
- [Architecture decision records](../adr/README.md)
