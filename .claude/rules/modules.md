---
paths:
  - "modules/**"
---

# Module rules

- DO use the standard layout: `src/domain/`, `src/application/`, `src/infrastructure/`, `src/http/`, `src/events/`, `src/workers/`, `src/index.ts`. See [modules/README.md](../../modules/README.md).
- DO make `src/index.ts` the only public entry point. Other code imports `@offgrid/<name>`, never `src/` internals.
- DO keep `src/domain/` pure: no Prisma, Fastify, `pg`, `fs`, `http` or other I/O imports. Enforced by `pnpm check:boundaries` ([boundaries.md](../../docs/architecture/boundaries.md)).
- DO keep domain code free of imports from `infrastructure/`, `http/`, `events/` and `workers/`. Adapters depend on the domain, never the reverse.
- DO read and write data through the Prisma client, in functions that take the client as a parameter. DON'T add a SQL function for a read or a write, since it hides the query from the code and from debugging.
- DO use a read-only RLS policy, written in a migration and keyed on one value that the transaction sets, when a lookup must see a row before any user context exists (for example sign-in by email). DON'T widen an existing policy for it.
- DO keep a `SECURITY DEFINER` function only where RLS cannot express the access, and name the reason in its migration and the module README. Today that is `identity.user_count()` (the instance size) and the outbox functions that publish events ([ADR 0011](../../docs/adr/0011-restricted-event-access-and-retention.md)).
- DO touch only this module's own Postgres schema. A module reads its own data directly, through its own tables and read policies. It reads another module's data only through a read-only projection fed by events ([ADR 0002](../../docs/adr/0002-outbox-events-and-projections.md)).
- DON'T build a projection of the module's own data. The family module lists families from its own `family_member` and `family` tables.
- DO communicate with other modules through versioned events and `packages/contracts` ([ADR 0006](../../docs/adr/0006-modular-monolith.md)).
- DON'T import another module's code, even from its `src/` folder. Cross-module imports fail `module-public-api`.
- DON'T import from `apps/` into `modules/`. Apps wire modules together.
- DON'T add a circular import between files. `no-circular` fails the build.
- DON'T add a SQL join across module schemas ([ADR 0009](../../docs/adr/0009-table-ownership-scopes.md)).
- DON'T put access-control or export logic behind a feature flag ([CLAUDE.md](../../CLAUDE.md)).
