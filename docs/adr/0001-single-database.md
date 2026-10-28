# 0001. One Postgres database with a schema and role per module

- **Status:** Accepted

## Context

Offgrid is a self-hosted app suite that runs on modest hardware, such as a Raspberry Pi. Each household runs its own instance. Data from different modules must stay separated, but operating several databases would add cost for a single household.

## Decision

- One Postgres instance holds one database, `offgrid`.
- Each module owns one schema, named after the module. A module reads and writes only its own schema.
- Each module has two database roles. The owner role runs its migrations. The app role is used at runtime and has only the privileges it needs.
- Every row carries a `family_id`. Row-level security policies use it to isolate families.

## Consequences

- Operations stay simple: one database to back up, restore and monitor.
- Module boundaries are enforced by the database as well as by code and CI checks.
- Cross-module reads cannot use SQL joins. They go through events and projections (see [0002](0002-outbox-events-and-projections.md)).
- Every table needs a `family_id` and an RLS policy. The database helpers in `packages/db` must make this the default.
