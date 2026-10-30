# Architecture decision records

Architecture decisions live here, one file per decision. Read the records that touch your change before you start (see [CONTRIBUTING.md](../../CONTRIBUTING.md)).

## Process

1. Copy [0000-template.md](0000-template.md) to `NNNN-short-slug.md`, using the next free number. Numbers are never reused.
2. Set **Status** to `Proposed`, then `Accepted` once the decision is agreed and implemented.
3. An accepted record is immutable except for its status. To change a decision, write a new record and mark the old one `Superseded by NNNN`.
4. Add the record to the index below in the same change.

Statuses: `Proposed`, `Accepted`, `Superseded`.

## Index

| Number                                                | Title                                                                        | Status                    |
| ----------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------- |
| [0001](0001-single-database.md)                       | One Postgres database with a schema and role per module                      | Superseded by 0009        |
| [0002](0002-outbox-events-and-projections.md)         | Outbox events and read-only projections                                      | Superseded by 0010        |
| [0003](0003-built-in-tunnel-deferred.md)              | Built-in tunnel for remote access, deferred                                  | Accepted                  |
| 0004                                                  | Intentionally skipped                                                        | -                         |
| [0005](0005-license.md)                               | License: FSL-1.1-ALv2 with trademark policy                                  | Accepted                  |
| [0006](0006-modular-monolith.md)                      | Modular monolith                                                             | Accepted                  |
| [0007](0007-e2e-playwright-bdd.md)                    | End-to-end tests with Playwright-BDD                                         | Accepted                  |
| [0008](0008-prisma-multi-schema.md)                   | Prisma with per-module schemas, roles and RLS                                | Accepted                  |
| [0009](0009-table-ownership-scopes.md)                | Database per module with an ownership scope per table                        | Accepted                  |
| [0010](0010-pluggable-event-transport.md)             | Postgres outbox as the source of events, pluggable transport                 | Superseded by 0011        |
| [0011](0011-restricted-event-access-and-retention.md) | Restricted event access, module-scoped delivery and retention                | Partly superseded by 0014 |
| [0012](0012-event-delivery-and-publish-authority.md)  | Event delivery is not tenant-filtered; publishing is limited to module roles | Accepted                  |
| [0013](0013-projections-for-other-modules-only.md)    | Projections are for another module's data only                               | Accepted                  |
| [0014](0014-subscriber-handlers-on-module-logins.md)  | Subscriber handlers run on their module login, with at-least-once delivery   | Accepted                  |
