# 0017. Two database roles for all modules, and Prisma Migrate

- **Status:** Proposed

## Context

[0008](0008-prisma-multi-schema.md) and [0009](0009-table-ownership-scopes.md) give each module its own owner role and app role. Each module runs its migrations with a runner of its own, and [0008](0008-prisma-multi-schema.md) keeps Prisma out of migrations, because Prisma Migrate keeps one history table and runs as one owner role. [0011](0011-restricted-event-access-and-retention.md), [0012](0012-event-delivery-and-publish-authority.md) and [0014](0014-subscriber-handlers-on-module-logins.md) add bus memberships, per-module logins and a publish check on role names to keep module roles apart.

With twelve schemas this model needs twenty-four roles, one runner, one connection pool per module login and a set of init scripts that create them. Its isolation between modules is enforced by the database, but the same modules are already kept apart by code rules ([.claude/rules/modules.md](../../.claude/rules/modules.md)) and by CI checks (`pnpm check:boundaries`). The database enforces the user and family boundary through row-level security ([0009](0009-table-ownership-scopes.md)), and that boundary stays.

We tested the alternative on PostgreSQL 17 with Prisma 7.10.1, outside the repository:

- `prisma migrate deploy` applied two migrations in two schemas. They contained raw SQL and the `offgrid_declare_scope` helper.
- The helper granted privileges to one shared app role. It needs no per-module role.
- Migrations ran as a migration role that is not a superuser, and that role owned the tables with row-level security enabled.

Not tested: `prisma migrate dev`, which compares the database with `schema.prisma`. That file cannot express row-level security policies or check constraints, so it would report drift.

## Decision

- We will use two database roles for the whole database, not one pair per module:
  - `offgrid_migrator` owns every module schema and table, and runs migrations. The server never connects with it.
  - `offgrid_app` is the runtime role. It has DML grants on the tables and owns nothing. The server connects with it for every module, for the event bus and for subscriber handlers.
- The migration role must not be the runtime role. A table owner bypasses row-level security unless the table forces it, so a runtime owner would skip the policies silently.
- We will run migrations with Prisma Migrate. Migration files live in `packages/db/prisma/migrations/`, one folder per migration, named `<timestamp>_<module>_<name>`, and are applied with `prisma migrate deploy` as `offgrid_migrator`. Prisma's history table, `public._prisma_migrations`, replaces `public.schema_migrations`.
- Migrations are raw SQL. Each migration declares the ownership scope of every table it creates, with `offgrid_declare_scope`. We will not use `prisma migrate dev` against a shared database. The Prisma schema still lists every table for the generated client.
- The module that owns a schema writes its migrations. A migration may only create or change tables in that module's schema. Review checks this, since the database no longer enforces it.
- [0009](0009-table-ownership-scopes.md) keeps its four scopes. The helper grants to `offgrid_app`. We add a fifth scope, `instance`, for a table that belongs to the whole instance: no owner column, the app role may read and write it, and it holds no personal data about any one person. The first use is the instance settings row ([0016](0016-local-authentication-model.md)). One exception: an instance's own outgoing mail account, its address, username and sealed app password, may sit in this scope as the instance's configuration ([0018](0018-outgoing-mail-to-a-chosen-provider.md)).
- The publish check in [0012](0012-event-delivery-and-publish-authority.md) accepts only `offgrid_app`, not any role whose name ends in `_app`.
- Each subscriber handler runs on the runtime role. [0014](0014-subscriber-handlers-on-module-logins.md)'s rules on idempotency and at-least-once delivery stay.

## Consequences

- Easier: two roles instead of twenty-four, one migration history, one connection pool per process, no bus membership workaround, and no per-module runner or init scripts for roles.
- Harder: database isolation between modules is gone. A bug in one module can read or write another module's tables. Module boundaries now rest on code rules, dependency-cruiser checks, reviews and the row-level security that protects users and families. The acceptance criterion in [OG-46](https://linear.app/offgridos/issue/OG-46) that a module role can reach only its own schema no longer applies, and [0016](0016-local-authentication-model.md) must be updated when it is accepted.
- A leaked runtime credential reaches every schema. The migration credential is kept off the server.
- [0008](0008-prisma-multi-schema.md), [0009](0009-table-ownership-scopes.md), [0012](0012-event-delivery-and-publish-authority.md) and [0014](0014-subscriber-handlers-on-module-logins.md) are partly superseded by this record. Their other parts still apply.
- Implemented with this record: the init scripts and the `offgrid_declare_scope` helper for the two roles and the new `instance` scope; the existing migrations re-baselined as Prisma folders `20261101000000_outbox_init` and `20261101000100_family_init`, since no database has been released; `packages/db` runs `prisma migrate deploy`; the publish check accepts only `offgrid_app`; the event bus and module code share one pool; the server reads `public._prisma_migrations`; and the rules, skills and READMEs describe the new model.
- Tests cover the migration deploy on real Postgres, the `instance` scope, the shared runtime role's row-level security and its read-only shared table, and the bus delivering through one runtime pool.
