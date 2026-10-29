# 0009. One Postgres database with a schema and role per module, and an ownership scope per table

- **Status:** Accepted

## Context

[0001](0001-single-database.md) chose one Postgres database with a schema and role per module, and said every row carries a `family_id`. That last clause is too strict. Four kinds of data exist:

- Entities that a user creates, such as lists, notes and calendars. Each one can be private to its user or shared with the family, and both can exist in the same table. The owner is chosen per row.
- Data that always belongs to one family, such as the family's membership or settings.
- Data that always belongs to one user, such as credentials or personal preferences.
- Reference data that is the same for every person and household, such as meal ingredients or gym exercises. It may later be maintained in the cloud and synced to the local server. It has no owner.

Forcing a `family_id` on every row would hide private data inside a family, and would put a meaningless owner on shared data.

## Decision

We keep the decisions of 0001 about the database, and replace the `family_id` clause with an ownership scope.

- One Postgres instance holds one database, `offgrid`.
- Each module owns one schema, named after the module. A module reads and writes only its own schema.
- Each module has two database roles. The owner role runs its migrations. The app role is used at runtime and has only the privileges it needs.
- Every table declares exactly one ownership scope:
  - **family-or-user**: each row is owned by either a user or a family. The table has a nullable `user_id` and a nullable `family_id`, and a check constraint requires exactly one of them. A row with a `user_id` is private to that user. A row with a `family_id` is shared with that family. A row-level security policy allows a row only to its user, or to the members of its family under the checks in `packages/access-control`. This is the default for entities that users create.
  - **family**: every row belongs to a family. The table has a non-null `family_id`, and a row-level security policy limits access to that family.
  - **user**: every row belongs to one user. The table has a non-null `user_id`, and a row-level security policy limits access to that user.
  - **shared**: rows are reference data that is identical for every person and household. The table has no owner column and holds no personal data. The app role can only read it. Rows are written by migrations, seeds or a sync job that runs as the owner role.
- A row refers to a shared row by its id. A household's own variation, such as a custom ingredient, is an owned row. It is never an edit of a shared row.

## Consequences

- Operations stay simple: one database to back up, restore and monitor.
- Module boundaries are enforced by the database as well as by code and CI checks.
- Cross-module reads cannot use SQL joins. They go through events and projections (see [0002](0002-outbox-events-and-projections.md)).
- The scope is a visible choice in every migration. The helpers in `packages/db` make the owned scopes the default, and shared is an explicit opt-out that review must question.
- A migration test checks the scope. Owned tables block rows of another user or family, and a private row stays hidden from other members of the same family. A family-or-user table rejects a row with both owners or neither. A shared table rejects writes from the app role.
- Reviewers treat a table with no declared scope, a shared table with personal data, and an owned table without its owner column or row-level security policy as blocking.
- Moving an entity between private and family-shared is a change of its owner column, and must go through the same access checks as creating it.
- Syncing shared data from the cloud is not built yet. This record only keeps the table model ready for it.
