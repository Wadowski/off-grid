# 0006. Modular monolith

- **Status:** Accepted

## Context

Offgrid needs clear module boundaries so each feature can evolve on its own. Its target hosts are small, and a household should not have to operate a distributed system to run it.

## Decision

- The local server is one process. It loads all modules and runs all workers.
- Each feature lives in its own folder under `modules/`. A module exposes only its `index.ts` and its event contracts.
- Module boundaries are enforced in CI by dependency rules. The rules are documented in `docs/architecture/boundaries.md` once the check is added.

## Consequences

- Deployment and debugging stay simple: one process, one database (see [0001](0001-single-database.md)).
- A module can later be extracted into its own process because it talks to others only through events (see [0002](0002-outbox-events-and-projections.md)).
- Violations fail the build, so agents and contributors cannot break the structure without a visible error.
