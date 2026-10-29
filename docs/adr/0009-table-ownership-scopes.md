# 0009. One Postgres database with a schema and role per module, and an ownership scope per table

- **Status:** Accepted

## Context

[0001](0001-single-database.md) chose one Postgres database with a schema and role per module, and said every row carries a `family_id`. That last clause is too strict. Three kinds of data exist:

- Data that belongs to a household, such as a family's lists, notes and calendar.
- Data that belongs to one person, such as a user's own settings or private notes.
- Reference data that is the same for every person and household, such as meal ingredients or gym exercises. It may later be maintained in the cloud and synced to the local server. It has no owner.

Forcing a `family_id` on all of them would either put a meaningless owner on shared data or force each household to keep its own copy.

## Decision

We keep the decisions of 0001 about the database, and replace the `family_id` clause with an ownership scope.

- One Postgres instance holds one database, `offgrid`.
- Each module owns one schema, named after the module. A module reads and writes only its own schema.
- Each module has two database roles. The owner role runs its migrations. The app role is used at runtime and has only the privileges it needs.
- Every table declares exactly one ownership scope:
  - **family**: rows belong to a family. The table has a non-null `family_id`, and a row-level security policy limits access to that family.
  - **user**: rows belong to one user. The table has a non-null `user_id`, and a row-level security policy limits access to that user.
  - **shared**: rows are reference data that is identical for every person and household. The table has no owner column and holds no personal data. The app role can only read it. Rows are written by migrations, seeds or a sync job that runs as the owner role.
- A family-owned or user-owned row refers to a shared row by its id. A household's own variation, such as a custom ingredient, is a family-owned row. It is never an edit of a shared row.

## Consequences

- Operations stay simple: one database to back up, restore and monitor.
- Module boundaries are enforced by the database as well as by code and CI checks.
- Cross-module reads cannot use SQL joins. They go through events and projections (see [0002](0002-outbox-events-and-projections.md)).
- The scope is a visible choice in every migration. The helpers in `packages/db` make family and user scope the default, and shared is an explicit opt-out that review must question.
- A migration test checks the scope: family and user tables block rows of another owner, and a shared table rejects writes from the app role.
- Reviewers treat a table with no declared scope, a shared table with personal data, and a user-owned or family-owned table without its row-level security policy as blocking.
- Syncing shared data from the cloud is not built yet. This record only keeps the table model ready for it.
