# 0010. Postgres outbox as the source of events, with a pluggable transport

- **Status:** Accepted
- **Supersedes:** [0002](0002-outbox-events-and-projections.md)

## Context

[0002](0002-outbox-events-and-projections.md) decided that events are written to a transactional outbox in Postgres, and that the server never uses Redis or an external message broker. That rule fits the local server, which must run on a Raspberry Pi with no extra services. It does not fit a cloud deployment or a future multi-process setup, where a broker such as NATS or RabbitMQ may be the right transport. A small broker runs on a Raspberry Pi 4 or 5, so the hardware alone does not rule one out.

The transactional guarantee is the part that must not be lost. A broker cannot commit an event in the same transaction as a business change, so the outbox stays the write path for every deployment.

## Decision

- Events are written to the Postgres outbox in the caller's transaction (`publish(tx, ...)`). This is the source of truth and the only way a module emits an event.
- Delivery happens through a **transport**. A transport receives committed events from the outbox relay.
- The default transport is **in-process**. Subscribers in the same process receive each event in order, inside a transaction that also carries their projection writes. Retries and the dead-letter queue apply to this path.
- An optional **external transport** (for example a broker) receives the same committed events through the same relay and cursor mechanism. It is configured per deployment. No module code changes when a transport is added or removed.
- No transport is required. The server runs with the in-process transport alone, so a deployment without a broker stays supported.
- Each transport has its own cursor, so one slow or failing transport does not hold back the others.

## Consequences

- Events still commit atomically with the change that caused them, for every deployment.
- A broker is an operational choice, not an architectural one. Adding it needs a configuration change and an adapter, not a new decision for each module.
- The relay, cursors and dead-letter table are the same for every transport, so they are tested once.
- Consumers outside the process must handle duplicate delivery, because a transport may resend after a crash. Each event carries an id and a version, and consumers check them.
- An external transport adds a dependency that the Raspberry Pi build must not require by default. Its adapter lives in its own package and is opt-in.
- Projections still use the `sourceVersion` checks described in 0002.
