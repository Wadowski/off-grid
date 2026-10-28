# 0002. Outbox events and read-only projections

- **Status:** Proposed. To be finalised by the event-bus issue after its spike.

## Context

Modules must stay independently extractable (see [0006](0006-modular-monolith.md)). A module cannot call another module's code or query its tables directly, but some modules still need data owned by others.

## Decision

- Modules communicate only through versioned events. An event is written to a transactional outbox table in Postgres in the same transaction as the change that caused it.
- A relay reads the outbox and delivers events to subscribers inside the same process.
- A consumer keeps a narrow, read-only projection of the data it needs from another module. A projection is never written back to its source.
- We do not use Redis or an external message broker.

## Consequences

- Events and the state change commit together, so no event is lost and none is emitted for a rolled-back change.
- Consumers must handle duplicate and out-of-order delivery. Each event carries a version and consumers check it.
- Released event versions are frozen. Changes need a new version.
- Eventual consistency is visible to users. Screens must tolerate a short delay after a change.
