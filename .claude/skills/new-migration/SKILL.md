---
name: new-migration
description: Add a database migration for one module's own Postgres schema, with family_id and an RLS policy on every table, plus a test that applies it to a real Postgres. Use when a module needs a new table, column, index or policy, or when the user asks for a migration.
---

# new-migration

Migrations change only the module's own schema, run as the module's owner role, and are never edited once applied. Read first: [.claude/rules/migrations.md](../../rules/migrations.md), [ADR 0001](../../../docs/adr/0001-single-database.md), [ADR 0008](../../../docs/adr/0008-prisma-multi-schema.md) and [packages/db/README.md](../../../packages/db/README.md).

Note: `packages/db` is a stub. Before you write a migration, confirm which migration tool and RLS helpers it provides. If there is none, stop and ask; do not hand-roll a migration runner.

## Steps

1. **Identify the schema and owner role.** Read the module's README and `packages/db`. The migration targets only that module's schema.
   Verify: the target schema name matches the module (`modules/<name>`), and no other schema appears in the change.

2. **Check the migration history.** Never edit a migration that has been applied anywhere, and never reorder or rename one. Look at the existing migrations for the module.
   Verify: `git log --oneline -- <migrations dir>` shows the last applied migration; the new one has a later timestamp.

3. **Write the migration.** Create a new file with the next timestamp. Every table gets a `family_id` column and an RLS policy, using the `packages/db` helpers so the policy is the default, not hand-written SQL. Review raw SQL like application code.
   Verify: the file exists in the module's migrations folder and contains `family_id` for each new table.

4. **Run it as the owner role.** Apply the migration with the owner role, not the app role.
   Verify: the migration command from `packages/db` completes against a local Postgres without error.

5. **Test it on a real Postgres.** Add a test next to the migration that applies it to a Postgres container, then checks that: the table exists, `family_id` is not null, and RLS blocks a row from another family.
   Verify: `pnpm --filter @offgrid/<name> test` passes.

6. **Check the boundaries and the whole repo.** The migration must not touch another module's schema.
   Verify: `pnpm lint && pnpm typecheck && pnpm test && pnpm check:boundaries` pass.

7. **Record the decision if it is one.** A new policy pattern or a change to how schemas are owned needs an ADR; use the `new-adr` skill.
   Verify: `ls docs/adr` shows the ADR, or the migration is confirmed to follow existing ADRs.

## Do not

- Put an RLS policy outside a migration.
- Use the app role to run migrations.
- Add a cross-schema join or foreign key.
- Edit a migration that another developer or CI may already have applied.
