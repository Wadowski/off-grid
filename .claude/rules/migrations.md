---
paths:
  - "**/migrations/**"
  - "packages/db/**"
---

# Migration rules

- DO write migrations only for the module's own schema, using the module's owner role ([ADR 0001](../../docs/adr/0001-single-database.md), [ADR 0008](../../docs/adr/0008-prisma-multi-schema.md)).
- DO give every table a `family_id` column and an RLS policy. The helpers in `packages/db` make this the default.
- DO ship each migration with a test that applies it to a real Postgres.
- DO review raw SQL in migrations (RLS policies, helpers) like application code.
- DON'T edit a migration that has been applied anywhere. Add a new migration instead.
- DON'T let a migration touch another module's schema.
- DON'T add RLS policies by hand outside a migration. They are part of the migration ([ADR 0008](../../docs/adr/0008-prisma-multi-schema.md)).
- DON'T reorder or rename existing migrations. Keep the timestamp order.
- DON'T use the app role to run migrations. Migrations run as the owner role.
