---
name: new-module
description: Scaffold a new feature module under modules/<name> with the standard layout, its own schema and role, index.ts, registration in apps/main-server, a feature file and a README. Use when the user asks to add a module, or when a Linear issue creates a new modules/<name> package.
---

# new-module

A module is one feature folder in the modular monolith. It runs in the single server process and owns one Postgres schema. Read first: [modules/README.md](../../../modules/README.md), [.claude/rules/modules.md](../../rules/modules.md), [ADR 0006](../../../docs/adr/0006-modular-monolith.md), [ADR 0001](../../../docs/adr/0001-single-database.md) and [ADR 0008](../../../docs/adr/0008-prisma-multi-schema.md).

Note: `modules/family` is the reference module (see its README). Copy its `package.json`, `tsconfig.json` and layout; do not invent a new shape.

## Steps

1. **Check the name and the stub.** The name is lowercase, one word (`lists`, `notes`). If `modules/<name>` already exists, read it and extend it rather than replacing it.
   Verify: `ls modules/<name>` shows `package.json`, `tsconfig.json`, `README.md` and `src/index.ts`, or the folder does not exist yet.

2. **Create the layout.** Under `modules/<name>/src/` create exactly these folders, each with a `.gitkeep` until it has code:
   `domain/`, `application/`, `infrastructure/`, `http/`, `events/`, `workers/`.
   Verify: `find modules/<name>/src -type d` lists all six.

3. **Write `src/index.ts`.** This is the only public entry point. Export the module's factory and public types, nothing from `src/` internals. Follow the header and style of `modules/family/src/index.ts`.
   Verify: `pnpm typecheck` passes.

4. **Declare the schema and role.** The module gets its own Postgres schema and owner role. Follow [ADR 0008](../../../docs/adr/0008-prisma-multi-schema.md) and the helpers in `packages/db`. Add the schema name to `DATABASE_SCHEMAS` in `packages/db/src/schema-names.ts` and the init scripts in `infra/init/sql/` if it is new. Use `offgrid_declare_scope` for every table.
   Verify: `packages/db/src/index.ts` exports what you used.

5. **Add the first migration.** Use the `new-migration` skill for the schema's first migration, with an ownership scope declared for every table.
   Verify: the migration test from `new-migration` passes.

6. **Register in the server.** Add the module to `apps/main-server` wiring, importing only `@offgrid/<name>`. Add the workspace dependency in `apps/main-server/package.json` the same way other modules are listed.
   Verify: `pnpm typecheck` and `pnpm check:boundaries` pass. Boundaries fail if the server reaches into `src/`.

7. **Add the feature file.** Use the `write-feature` skill to create `e2e/features/<name>/` with at least one `@wip` scenario and `@module:<name>`.
   Verify: `ls e2e/features/<name>` lists the file.

8. **Write the README.** Describe the module's purpose, owned schema and role, published events, and public API. Keep it short; link to ADRs rather than copying them.
   Verify: `pnpm format:check` passes.

9. **Run the full check.** Run the repo checks.
   Verify: `pnpm lint && pnpm typecheck && pnpm test && pnpm check:boundaries && pnpm check:agent-config` all pass.

## Do not

- Import another module's code, even from its `src/` folder.
- Put domain logic in `index.ts`. Keep `src/domain/` free of I/O imports.
- Touch another module's schema, or add a SQL join across schemas.
- Build a projection of the module's own data. Read its own tables and read policies, as `modules/family` does.
- Gate access control or export behind a feature flag.
