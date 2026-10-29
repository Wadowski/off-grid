# 0008. Prisma with per-module schemas, roles and RLS

- **Status:** Accepted

## Context

Data access needs typed queries, migrations and row-level isolation across modules (see [0009](0009-table-ownership-scopes.md)). Hand-written SQL for every module would be slow to build and easy to get wrong.

The database package spike (OG-30) tested the original decision against a real Postgres 16 with Prisma 7.10.1 (the newest stable release; the `latest` tag was a release candidate and was not used). It found:

- Prisma's client works with several schemas and with per-module runtime roles. A transaction that sets `app.family_id` with `set_config(..., true)` sees only that family's rows through an RLS policy. A runtime role on one module's schema is refused on another module's schema with `permission denied`.
- Prisma Migrate cannot run per-module migrations under per-module owner roles. It keeps one history table, `public._prisma_migrations`, for the whole database. The owner role of one module needs write access to `public` to create it, and a single migration spanning several schemas runs as one owner role, which then fails on the other module's schema. A partial run left a half-applied state during the spike.

## Decision

- Prisma is the data access layer. It is not the migration tool.
- The Prisma schema is one file, `packages/db/prisma/schema.prisma`, listing every module schema in its `schemas` option. Module models are added there by the module that owns the schema. Isolation between modules comes from database roles and RLS, not from separate Prisma files.
- Migrations are raw SQL files in each module's folder (`NNNN_name.sql`). The migration runner in `packages/db` applies them in dependency order. It connects as `offgrid_migrator`, switches to the module's owner role (`SET LOCAL ROLE <module>_owner`) for each migration, and records each migration with a checksum in `public.schema_migrations`, in the same transaction. An applied migration whose file changed is refused, and a failing migration rolls back with no history row.
- Each module has an owner role (runs its migrations) and an app role (runtime, DML on its own schema only). The application connects with the app role through `createModuleDb`.
- Ownership scopes (ADR 0009) are declared with the SQL helper `public.offgrid_declare_scope`, which adds the owner check, enables row-level security with its policy, and grants the app role its privileges. Migrations call it instead of writing RLS by hand. `assertOwnershipScopes` checks every table after migrations.
- Prisma's generated client is written to `packages/db/src/generated` and is not committed. `pnpm generate` creates it before typecheck, lint and test.

## Consequences

- Schema changes go through migrations. An applied migration is never edited; a new one is added.
- Prisma Migrate is not used, so there is no `prisma migrate` history to keep in sync. The runner is the only path to change the schema.
- Raw SQL is allowed for RLS policies and helpers, and is reviewed as part of the migration.
- Prisma's generated client has internal import cycles, so `pnpm check:boundaries` needs the generated folder excluded from the cycle check. Hand-written code stays checked.
- Prisma 7 needs a driver adapter (`@prisma/adapter-pg`). Its CLI and engine downloads run at install time, which is why `prisma` and `@prisma/engines` are allowed to run build scripts in `pnpm-workspace.yaml`.
