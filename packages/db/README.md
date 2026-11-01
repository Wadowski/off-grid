# @offgrid/db

Purpose: database access for the `offgrid` Postgres database. The Prisma client, the migration runner, ownership scopes and row-level security helpers. Decided in [ADR 0008](../../docs/adr/0008-prisma-multi-schema.md), [ADR 0009](../../docs/adr/0009-table-ownership-scopes.md) and [ADR 0017](../../docs/adr/0017-shared-database-roles-and-prisma-migrate.md).
Public API: only what `src/index.ts` exports; never import from `src/` internals.
Owner: platform team

## Layout

- `prisma/schema.prisma`: one Prisma schema for the whole database. Module models are added here by the owning module.
- `prisma/migrations/`: every migration, one folder per migration named `<timestamp>_<module>_<name>`, each with a `migration.sql`. Prisma Migrate applies them in folder-name order.
- `prisma.config.ts`: reads the migration connection from `DATABASE_URL`.
- Generated Prisma client: written to `node_modules/.prisma/offgrid-db`, so it is never committed. Run `pnpm generate` (typecheck, lint, test and build do it).
- `src/`: `createModuleDb`, `migrateDeploy`, `loadMigrations`, `assertOwnershipScopes`, `withFamilyContext`, `withUserContext`.
- `test/`: Testcontainers harness on top of `@offgrid/test-db`.
- The init SQL that creates the roles and schemas is in [`infra/init/sql/`](../../infra/init/sql/): `00-login-roles.sh` (logins from secrets), `01-roles-and-schemas.sql` and `02-scope-helpers.sql` (the `offgrid_declare_scope` function).

## Roles

- `offgrid_migrator` owns every module schema and table. It runs migrations and is never used by the server at runtime.
- `offgrid_app` is the runtime role for every module, the event bus and subscriber handlers. It has DML grants on the tables and owns nothing, so row-level security applies to it.

The two roles are separate because a table owner bypasses row-level security unless the table forces it.

## Migrations

Run `migrateDeploy` (or `prisma migrate deploy` in `packages/db`) as `offgrid_migrator`. Prisma records each migration in `public._prisma_migrations`. An applied migration whose file changes is refused, so add a new folder instead of editing one.

Declare the ownership scope of every table in the migration, right after creating it:

```sql
CREATE TABLE lists.list (id uuid PRIMARY KEY, family_id uuid, user_id uuid, title text NOT NULL);
SELECT public.offgrid_declare_scope('lists', 'list', 'family-or-user');
```

Scopes: `family-or-user`, `family`, `user`, `shared` and `instance` (see ADR 0009 and ADR 0017). The helper adds the owner check, enables RLS with its policy and grants the runtime role its privileges. `assertOwnershipScopes` checks every table against its declared scope.

## Request context

RLS policies read `app.family_id` and `app.user_id`, set per transaction with `withFamilyContext` and `withUserContext`. Unset means no rows (fail closed). These helpers only set the context. Whether the caller may act for that family is checked by `packages/access-control`.

RLS limits what a query can see for the context it was given. Module boundaries are enforced by code rules and CI checks, not by separate database roles (ADR 0017).
