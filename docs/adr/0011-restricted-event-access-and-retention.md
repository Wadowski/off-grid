# 0011. Restricted event access, module-scoped delivery and retention

- **Status:** Accepted; handler execution and bus membership are superseded by [0014](0014-subscriber-handlers-on-module-logins.md)
- **Supersedes:** [0010](0010-pluggable-event-transport.md)

## Context

[0010](0010-pluggable-event-transport.md) decided that the Postgres outbox is the source of events, with a pluggable transport, and that the server runs with the in-process transport alone. The design of how modules read events was not settled there. Two questions remained: which roles may read the event stream, and how a subscriber's handler is run.

Every module reading the whole event stream would let any module see another module's personal data. A handler that ran as the bus role would have more privileges than its own module, so a projection could write to any schema. The outbox would also grow without bound, since nothing removed delivered events.

## Decision

- Modules publish with `publish(tx, ...)`, which calls the SECURITY DEFINER function `outbox.append_event` inside the caller's transaction. This is the only way a module emits an event. Modules never write to the `outbox` schema directly.
- Only the bus role `outbox_app` reads the event stream and advances subscriber cursors, through definer functions. Module roles cannot read events, and the stream is not exposed to module code.
- The bus runs each subscriber's handler as that subscriber's module role, with `SET ROLE <module>_app`. A handler has only the privileges of its own module, and a projection writes through its module's row-level security. The bus role is a member of every module role, the same membership model the migration runner uses. The membership is set in `infra/init/sql/03-bus-membership.sql`.
- Delivery is ordered per subscriber. A subscriber's cursor advances in the same transaction as its handler's writes. A failing handler is retried in a savepoint, three attempts in total with backoff, then recorded in `outbox.dead_letter`.
- The default transport is in-process. An optional external transport, such as a broker, receives the same committed events through the same cursor mechanism. Each transport has its own cursor, so one slow or failing transport does not hold back the others. A transport runs as the bus role and needs no module privileges. No transport is required, and the server runs with the in-process transport alone.
- The bus runs in the server process. It polls on an interval and wakes early on `LISTEN outbox_event`, which `append_event` raises on commit.
- Retention deletes an event only when it was published longer ago than the retention period and every registered subscriber cursor has passed it. A subscriber that is registered but has not started yet keeps the events it needs. Replay covers only retained events.

## Consequences

- Events still commit atomically with the change that caused them, for every deployment.
- A module cannot read another module's events directly. Reading them goes through the bus, so a privacy review of cross-module reads has one place to check.
- The bus role's membership in every module role is a privileged position, like the migration runner's. It must stay inside the server process and must not be exposed to module code.
- A broker is an operational choice, not an architectural one. Adding one needs a configuration change and an adapter, not a change to each module.
- Consumers outside the process must handle duplicate delivery, because a transport may resend after a crash. Each event carries an id and a version, and consumers check them.
- An external transport adds a dependency the Raspberry Pi build must not require by default. Its adapter lives in its own package and is opt-in.
- Projections still use the `sourceVersion` checks described in [0002](0002-outbox-events-and-projections.md).
- Replay after retention cannot rebuild a projection from events already pruned. A projection that needs full history must be rebuilt before retention removes its events.
