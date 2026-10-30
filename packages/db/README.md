# @offgrid/db

Purpose: database access for the `offgrid` Postgres database. Prisma client per module, the migration runner, ownership scopes and row-level security helpers. Decided in [ADR 0008](../../docs/adr/0008-prisma-multi-schema.md) and [ADR 0009](../../docs/adr/0009-table-ownership-scopes.md).

Public API: only what `src/index.ts` exports; never import from `src/` internals.
Owner: platform team

## Layout

- `prisma/schema.prisma`: one Prisma schema for the whole database. Module models are added here by the owning module.
- Generated Prisma client: written to `node_modules/.prisma/offgrid-db`, so it is never committed and the boundary check skips it. Run `pnpm generate` (typecheck, lint, test and build do it).
- `src/` helpers: `createModuleDb`, `withFamilyContext`, `withUserContext`, `runMigrations`, `assertOwnershipScopes`, `provisionLoginRole`.
- `test/`: Testcontainers Postgres harness and fixture migrations, used by the integration tests.
- The init SQL that creates schemas and roles is in [`infra/init/sql/`](../../infra/init/sql/): `01-roles-and-schemas.sql` and `02-scope-helpers.sql` (the `offgrid_declare_scope` function).

## Roles

For each schema `<m>`:

- `<m>_owner` owns the schema and runs the module's migrations. NOLOGIN.
- `<m>_app` is the runtime role. DML on its own schema only. Login is provisioned from a secret. Each module connects with its own login through `createModuleDb`; the event bus connects as `outbox_app`, which can assume the module roles to deliver events.
- `offgrid_migrator` is a member of every owner role. It runs the migration runner and keeps the history in `public.schema_migrations`.

## Migrations

Migrations are raw SQL files named `NNNN_name.sql`, one folder per module. `runMigrations` applies them in the order the caller gives, each as its module's owner role, in a transaction with its history row. An applied migration whose file changes is refused; add a new file instead.

Declare the ownership scope of every table in the migration, right after creating it:

```sql
CREATE TABLE lists.list (id uuid PRIMARY KEY, family_id uuid, user_id uuid, title text NOT NULL);
SELECT public.offgrid_declare_scope('lists', 'list', 'family-or-user');
```

Scopes: `family-or-user`, `family`, `user`, `shared` (see ADR 0009). The helper adds the owner check, enables RLS with its policy and grants the app role its privileges. `assertOwnershipScopes` checks every table against its declared scope.

## Request context

RLS policies read `app.family_id` and `app.user_id`, set per transaction with `withFamilyContext` and `withUserContext`. Unset means no rows (fail closed). These helpers only set the context. Whether the caller may act for that family is checked by `packages/access-control`.
