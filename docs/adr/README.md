# Architecture decision records

Architecture decisions live here, one file per decision. Read the records that touch your change before you start (see [CONTRIBUTING.md](../../CONTRIBUTING.md)).

## Process

1. Copy [0000-template.md](0000-template.md) to `NNNN-short-slug.md`, using the next free number. Numbers are never reused.
2. Set **Status** to `Proposed`, then `Accepted` once the decision is agreed and implemented.
3. An accepted record is immutable except for its status. To change a decision, write a new record and mark the old one `Superseded by NNNN`.
4. Add the record to the index below in the same change.

Statuses: `Proposed`, `Accepted`, `Superseded`.

## Index

| Number                                                   | Title                                                                                | Status                    |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------- |
| [0001](0001-single-database.md)                          | One Postgres database with a schema and role per module                              | Superseded by 0009        |
| [0002](0002-outbox-events-and-projections.md)            | Outbox events and read-only projections                                              | Superseded by 0010        |
| [0003](0003-built-in-tunnel-deferred.md)                 | Built-in tunnel for remote access, deferred                                          | Accepted                  |
| 0004                                                     | Intentionally skipped                                                                | -                         |
| [0005](0005-license.md)                                  | License: FSL-1.1-ALv2 with trademark policy                                          | Accepted                  |
| [0006](0006-modular-monolith.md)                         | Modular monolith                                                                     | Accepted                  |
| [0007](0007-e2e-playwright-bdd.md)                       | End-to-end tests with Playwright-BDD                                                 | Accepted                  |
| [0008](0008-prisma-multi-schema.md)                      | Prisma with per-module schemas, roles and RLS                                        | Partly superseded by 0017 |
| [0009](0009-table-ownership-scopes.md)                   | Database per module with an ownership scope per table                                | Partly superseded by 0017 |
| [0010](0010-pluggable-event-transport.md)                | Postgres outbox as the source of events, pluggable transport                         | Superseded by 0011        |
| [0011](0011-restricted-event-access-and-retention.md)    | Restricted event access, module-scoped delivery and retention                        | Partly superseded by 0014 |
| [0012](0012-event-delivery-and-publish-authority.md)     | Event delivery is not tenant-filtered; publishing is limited to module roles         | Partly superseded by 0017 |
| [0013](0013-projections-for-other-modules-only.md)       | Projections are for another module's data only                                       | Accepted                  |
| [0014](0014-subscriber-handlers-on-module-logins.md)     | Subscriber handlers run on their module login, with at-least-once delivery           | Partly superseded by 0017 |
| [0015](0015-no-reverse-proxy-cors-on-the-server.md)      | No reverse proxy; the server allows its web origins with CORS                        | Accepted                  |
| [0016](0016-local-authentication-model.md)               | Local authentication model: passwords, sessions, registration and recovery           | Partly superseded by 0018 |
| [0017](0017-shared-database-roles-and-prisma-migrate.md) | Two database roles for all modules, and Prisma Migrate                               | Proposed                  |
| [0018](0018-outgoing-mail-to-a-chosen-provider.md)       | Outgoing mail to a provider the owner chooses                                        | Accepted                  |
| [0019](0019-state-shared-between-instances.md)           | State that must be shared between server instances lives in Postgres                 | Proposed                  |
| [0020](0020-error-records-in-postgres.md)                | Error records are kept in Postgres for a retention period                            | Accepted                  |
| [0021](0021-family-membership.md)                        | Family membership: two roles, single-use invitation codes, one admin minimum         | Proposed                  |
| [0022](0022-active-family-per-session.md)                | Active family per session, and personal groups in the request context                | Proposed                  |
| [0023](0023-display-names-visible-to-family-members.md)  | Display names are copied to the family module and shown to people who share a family | Proposed                  |
