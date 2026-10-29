---
paths:
  - "**/migrations/**"
  - "packages/db/**"
---

# Migration rules

- DO write migrations only for the module's own schema, using the module's owner role ([ADR 0009](../../docs/adr/0009-table-ownership-scopes.md), [ADR 0008](../../docs/adr/0008-prisma-multi-schema.md)).
- DO declare one ownership scope for every table ([ADR 0009](../../docs/adr/0009-table-ownership-scopes.md)): `family` (non-null `family_id` and an RLS policy), `user` (non-null `user_id` and an RLS policy) or `shared` (reference data with no owner column and no personal data; the app role can only read it). The helpers in `packages/db` make `family` and `user` the default.
- DON'T mark a table `shared` unless its rows are identical for every person and household. A household's own variation is a `family` table.
- DO ship each migration with a test that applies it to a real Postgres.
- DO review raw SQL in migrations (RLS policies, helpers) like application code.
- DON'T edit a migration that has been applied anywhere. Add a new migration instead.
- DON'T let a migration touch another module's schema.
- DON'T add RLS policies by hand outside a migration. They are part of the migration ([ADR 0008](../../docs/adr/0008-prisma-multi-schema.md)).
- DON'T reorder or rename existing migrations. Keep the timestamp order.
- DON'T use the app role to run migrations. Migrations run as the owner role.
