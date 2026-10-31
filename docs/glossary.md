# Glossary

Terms as they are used in the code and in these docs. Where a term is planned but not built yet, the entry says so.

- **Access group**: The owner of a piece of data, and the unit that access checks work with. An access group is either a **family** or a single **user**, so one check covers private and shared data. See `packages/access-control/`.
- **Access level**: What a subject may do with a resource: `view`, `edit` or `manage`. Each level includes the ones below it.
- **Dead-letter queue (DLQ)**: The `outbox.dead_letter` table, where an event goes when a subscriber still fails after three attempts. It keeps the event and the error, so the event can be inspected and replayed. See `packages/event-bus/` and [ADR 0011](adr/0011-restricted-event-access-and-retention.md).
- **Event**: A versioned, immutable record that something happened in a module, for example `family-created-v1`. Events are defined in `packages/contracts/`. A released event version never changes; a change gets a new version.
- **Family**: A group of users who share data. A user can belong to several families. A family is one kind of access group.
- **Instance**: One installed copy of Offgrid on one machine, with its own database and secrets. The instance id is created once by the first-run setup and stored in `data/secrets/`.
- **Mini app**: A planned, separately installable feature that runs inside the suite. The term is in the project scope, but no mini app exists in the code yet.
- **Module**: One feature area of the server, in `modules/<name>/`, for example `family`. A module owns one Postgres schema and talks to other modules only through events and its public `index.ts`. See [modules/README.md](../modules/README.md).
- **Outbox**: The `outbox` schema. A module writes its events there in the same transaction as its data change, so an event is never lost and never sent for a change that did not commit. Subscribers read the outbox and advance their own cursor. See [ADR 0002](adr/0002-outbox-events-and-projections.md).
- **Projection**: A read-only copy, owned by one module, of data that belongs to another module. It is built from events and used only for that module's reads. A module never reads another module's tables directly. See [ADR 0013](adr/0013-projections-for-other-modules-only.md).
- **Schema (Postgres)**: A namespace inside the one Postgres database. Each module has its own schema, for example `family`, and its own roles that can write only there. See [ADR 0008](adr/0008-prisma-multi-schema.md).
- **Subscriber**: The code that reacts to an event published by another module. It runs under its module's own login and is retried on failure. See [ADR 0014](adr/0014-subscriber-handlers-on-module-logins.md).
- **Trace id**: An id that follows one request through the logs of the server, so one request can be followed across its log lines. See `packages/observability/`.
