---
paths:
  - "**/migrations/**"
  - "packages/db/**"
---

# Migration rules

Migrations run with Prisma Migrate from `packages/db/prisma/migrations` as `offgrid_migrator`. The server connects as `offgrid_app` ([ADR 0017](../../docs/adr/0017-shared-database-roles-and-prisma-migrate.md)).

- DO write each migration in its own folder, `<timestamp>_<module>_<name>/migration.sql`, and keep the folder for the module that owns the schema.
- DO declare one ownership scope for every table ([ADR 0009](../../docs/adr/0009-table-ownership-scopes.md)): `family-or-user` (each row is private to a user or shared with a family: nullable `user_id` and `family_id`, a check that exactly one is set, and an RLS policy; the default for entities users create, such as lists, notes and calendars), `family` (non-null `family_id` and an RLS policy), `user` (non-null `user_id` and an RLS policy), `shared` (reference data with no owner column and no personal data; the runtime role can only read it), or `instance` (one row set for the whole instance, no owner column, no personal data; the runtime role can read and write it). The helpers in `packages/db` make the owned scopes the default.
- DON'T mark a table `family` or `user` when its entities can be either private or family-shared. Use `family-or-user`.
- DON'T mark a table `shared` unless its rows are identical for every person and household. A household's own variation is an owned row.
- DO ship each migration with a test that applies it to a real Postgres.
- DO review raw SQL in migrations (RLS policies, helpers) like application code.
- DON'T edit a migration that has been applied anywhere. Add a new folder instead.
- DON'T let a migration touch another module's schema. The database no longer enforces this, so review must.
- DON'T add RLS policies by hand outside a migration. They are part of the migration.
- DON'T reorder or rename existing migrations. Keep the timestamp order.
- DON'T run migrations as the runtime role `offgrid_app`. Migrations run as `offgrid_migrator`, which owns the tables; a table owner bypasses row-level security.
