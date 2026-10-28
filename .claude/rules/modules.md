---
paths:
  - "modules/**"
---

# Module rules

- DO use the standard layout: `src/domain/`, `src/application/`, `src/infrastructure/`, `src/http/`, `src/events/`, `src/workers/`, `src/index.ts`. See [modules/README.md](../../modules/README.md).
- DO make `src/index.ts` the only public entry point. Other code imports `@offgrid/<name>`, never `src/` internals.
- DO keep `src/domain/` pure: no Prisma, Fastify, `pg`, `fs`, `http` or other I/O imports. Enforced by `pnpm check:boundaries` ([boundaries.md](../../docs/architecture/boundaries.md)).
- DO keep domain code free of imports from `infrastructure/`, `http/`, `events/` and `workers/`. Adapters depend on the domain, never the reverse.
- DO touch only this module's own Postgres schema. Reads of other data use a read-only projection ([ADR 0002](../../docs/adr/0002-outbox-events-and-projections.md)).
- DO communicate with other modules through versioned events and `packages/contracts` ([ADR 0006](../../docs/adr/0006-modular-monolith.md)).
- DON'T import another module's code, even from its `src/` folder. Cross-module imports fail `module-public-api`.
- DON'T import from `apps/` into `modules/`. Apps wire modules together.
- DON'T add a circular import between files. `no-circular` fails the build.
- DON'T add a SQL join across module schemas ([ADR 0001](../../docs/adr/0001-single-database.md)).
- DON'T put access-control or export logic behind a feature flag ([CLAUDE.md](../../CLAUDE.md)).
