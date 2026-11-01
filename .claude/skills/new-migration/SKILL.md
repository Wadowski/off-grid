---
name: new-migration
description: Add a database migration for one module's own Postgres schema, with a declared ownership scope (family-or-user, family, user or shared) on every table, plus a test that applies it to a real Postgres. Use when a module needs a new table, column, index or policy, or when the user asks for a migration.
---

# new-migration

Migrations change only the module's own schema, run as `offgrid_migrator` with Prisma Migrate, and are never edited once applied. Read first: [.claude/rules/migrations.md](../../rules/migrations.md), [ADR 0017](../../../docs/adr/0017-shared-database-roles-and-prisma-migrate.md), [ADR 0009](../../../docs/adr/0009-table-ownership-scopes.md) and [packages/db/README.md](../../../packages/db/README.md).

Note: migrations are folders in `packages/db/prisma/migrations`, applied by `prisma migrate deploy` (`pnpm --filter @offgrid/db migrate:deploy`). The `offgrid_declare_scope` helper declares scopes. Reference: `packages/db/prisma/migrations/*_family_init`.

## Steps

1. **Identify the schema.** Read the module's README and `packages/db`. The migration targets only that module's schema.
   Verify: the target schema name matches the module (`modules/<name>`), and no other schema appears in the change.

2. **Check the migration history.** Never edit a migration that has been applied anywhere, and never reorder or rename one. Look at the existing folders in `packages/db/prisma/migrations`.
   Verify: `git log --oneline -- packages/db/prisma/migrations` shows the last applied migration; the new folder has a later timestamp.

3. **Write the migration.** Create a new folder `<timestamp>_<module>_<name>` with a `migration.sql` and the next timestamp. Decide the ownership scope of each table: `family-or-user` (each row is private to a user or shared with a family: nullable `user_id` and `family_id`, a check that exactly one is set, and an RLS policy; use it for entities users create, such as lists, notes and calendars), `family` (a non-null `family_id` and an RLS policy), `user` (a non-null `user_id` and an RLS policy), or `shared` (reference data that is identical for every person and household, with no owner column, no personal data and read-only for the app role). Use the `packages/db` helpers so the policy is the default, not hand-written SQL. A household's own variation of shared data is an owned row. Review raw SQL like application code.
   Verify: the folder exists in `packages/db/prisma/migrations`, and each new table declares exactly one scope with the matching column and policy.

4. **Run it as the migration role.** Apply it with `prisma migrate deploy` as `offgrid_migrator`, not as the runtime role.
   Verify: `pnpm --filter @offgrid/db migrate:deploy` completes against a local Postgres without error.

5. **Test it on a real Postgres.** Add a test next to the migration that applies it to a Postgres container, then checks that: the table exists, and its scope holds. A `family` or `user` table has a non-null owner column, and RLS blocks a row of another family or user. A `family-or-user` table rejects a row with both owners or neither, hides a private row from other members of the same family, and hides a family row from other families. A `shared` table rejects writes from the app role.
   Verify: `pnpm --filter @offgrid/<name> test` passes.

6. **Check the boundaries and the whole repo.** The migration must not touch another module's schema.
   Verify: `pnpm lint && pnpm typecheck && pnpm test && pnpm check:boundaries` pass.

7. **Record the decision if it is one.** A new policy pattern or a change to how schemas are owned needs an ADR; use the `new-adr` skill.
   Verify: `ls docs/adr` shows the ADR, or the migration is confirmed to follow existing ADRs.

## Do not

- Put an RLS policy outside a migration.
- Use the runtime role `offgrid_app` to run migrations.
- Add a cross-schema join or foreign key.
- Edit a migration that another developer or CI may already have applied.
