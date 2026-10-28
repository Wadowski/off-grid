# 0008. Prisma with per-module schemas, roles and RLS

- **Status:** Proposed. To be finalised by the database package spike.

## Context

Data access needs typed queries, migrations and row-level isolation across modules (see [0001](0001-single-database.md)). Hand-written SQL for every module would be slow to build and easy to get wrong.

## Decision

- Prisma is the data access layer and the migration tool.
- Each module has its own Prisma schema, mapped to its own Postgres schema.
- Migrations run with the module's owner role. The application connects with its app role.
- Row-level security policies are part of the migrations, not added by hand.

## Consequences

- Schema changes go through migrations. An applied migration is never edited; a new one is added.
- Prisma's multi-schema support must be verified in the database package spike before this record is accepted.
- Raw SQL is allowed for RLS policies and helpers, and is reviewed as part of the migration.
