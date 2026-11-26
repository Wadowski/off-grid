# Architecture decision records

Architecture decisions live here, one file per decision. Read the records that touch your change before you start (see [CONTRIBUTING.md](../../CONTRIBUTING.md)).

## Process

1. Copy [0000-template.md](0000-template.md) to `NNNN-short-slug.md`, using the next free number. Numbers are never reused.
2. Set **Status** to `Proposed`, then `Accepted` once the decision is agreed and implemented.
3. An accepted record is immutable except for its status. To change a decision, write a new record and mark the old one `Superseded by NNNN`.
4. Add the record to the index below in the same change.

Statuses: `Proposed`, `Accepted`, `Superseded`.

## Index

| Number                                                              | Title                                                                                            | Status                    |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------- |
| [0001](0001-single-database.md)                                     | One Postgres database with a schema and role per module                                          | Superseded by 0009        |
| [0002](0002-outbox-events-and-projections.md)                       | Outbox events and read-only projections                                                          | Superseded by 0010        |
| [0003](0003-built-in-tunnel-deferred.md)                            | Built-in tunnel for remote access, deferred                                                      | Accepted                  |
| 0004                                                                | Intentionally skipped                                                                            | -                         |
| [0005](0005-license.md)                                             | License: FSL-1.1-ALv2 with trademark policy                                                      | Accepted                  |
| [0006](0006-modular-monolith.md)                                    | Modular monolith                                                                                 | Accepted                  |
| [0007](0007-e2e-playwright-bdd.md)                                  | End-to-end tests with Playwright-BDD                                                             | Accepted                  |
| [0008](0008-prisma-multi-schema.md)                                 | Prisma with per-module schemas, roles and RLS                                                    | Partly superseded by 0017 |
| [0009](0009-table-ownership-scopes.md)                              | Database per module with an ownership scope per table                                            | Partly superseded by 0017 |
| [0010](0010-pluggable-event-transport.md)                           | Postgres outbox as the source of events, pluggable transport                                     | Superseded by 0011        |
| [0011](0011-restricted-event-access-and-retention.md)               | Restricted event access, module-scoped delivery and retention                                    | Partly superseded by 0014 |
| [0012](0012-event-delivery-and-publish-authority.md)                | Event delivery is not tenant-filtered; publishing is limited to module roles                     | Partly superseded by 0017 |
| [0013](0013-projections-for-other-modules-only.md)                  | Projections are for another module's data only                                                   | Accepted                  |
| [0014](0014-subscriber-handlers-on-module-logins.md)                | Subscriber handlers run on their module login, with at-least-once delivery                       | Partly superseded by 0017 |
| [0015](0015-no-reverse-proxy-cors-on-the-server.md)                 | No reverse proxy; the server allows its web origins with CORS                                    | Accepted                  |
| [0016](0016-local-authentication-model.md)                          | Local authentication model: passwords, sessions, registration and recovery                       | Partly superseded by 0018 |
| [0017](0017-shared-database-roles-and-prisma-migrate.md)            | Two database roles for all modules, and Prisma Migrate                                           | Proposed, amended by 0036 |
| [0018](0018-outgoing-mail-to-a-chosen-provider.md)                  | Outgoing mail to a provider the owner chooses                                                    | Accepted                  |
| [0019](0019-state-shared-between-instances.md)                      | State that must be shared between server instances lives in Postgres                             | Proposed                  |
| [0020](0020-error-records-in-postgres.md)                           | Error records are kept in Postgres for a retention period                                        | Accepted                  |
| [0021](0021-family-membership.md)                                   | Family membership: two roles, single-use invitation codes, one admin minimum                     | Proposed                  |
| [0022](0022-active-family-per-session.md)                           | Active family per session, and personal groups in the request context                            | Proposed                  |
| [0023](0023-display-names-visible-to-family-members.md)             | Display names are copied to the family module and shown to people who share a family             | Proposed                  |
| [0024](0024-browser-notifications-web-push.md)                      | Browser notifications use web push, an exception to the no-outbound rule                         | Proposed                  |
| [0025](0025-one-module-owns-notifications.md)                       | One module owns every notification                                                               | Partly superseded by 0026 |
| [0026](0026-notifications-map-domain-facts.md)                      | Notifications map domain facts to notices                                                        | Accepted                  |
| [0027](0027-invitation-preview.md)                                  | Invitation preview: a code shows its family before the person joins                              | Proposed                  |
| [0028](0028-calendar-event-time-and-versions.md)                    | Calendar events: UTC bounds fixed at write time, per-user zone, one source version per event row | Proposed                  |
| [0029](0029-event-guest-access.md)                                  | Event guests read through row-level security and cannot write                                    | Accepted                  |
| [0030](0030-calendar-reminder-dispatch.md)                          | Calendar reminders: user-owned rows, one claim function for the worker                           | Accepted                  |
| [0031](0031-cross-entity-links.md)                                  | Cross-entity links: owner-scoped links, projected titles, guests read through a projection       | Accepted                  |
| [0032](0032-outbound-update-check-and-image-pull.md)                | Outbound update check and image pull, with a separate updater and a module that owns updates     | Proposed                  |
| [0033](0033-file-bytes-on-a-disk-volume.md)                         | File bytes live on a disk volume behind a storage port                                           | Accepted                  |
| [0034](0034-files-access-model-trash-and-versions.md)               | Files: family or user drives, row-level access, soft-delete trash and immutable versions         | Proposed                  |
| [0035](0035-realtime-notifications-over-sse.md)                     | Realtime notifications over server-sent events                                                   | Proposed                  |
| [0036](0036-migrator-owns-database-objects.md)                      | The migrator owns the database and the init-created objects                                      | Proposed                  |
| [0037](0037-cross-owner-move-copy-and-removal.md)                   | Cross-owner moves copy the subtree and remove the source, with an entry limit                    | Accepted                  |
| [0038](0038-streamed-upload-request-shape.md)                       | Uploads send the raw file bytes with the name and parent in headers                              | Accepted                  |
| [0039](0039-delete-non-current-version-and-restore-copies-bytes.md) | Delete a non-current file version, and a restore copies the bytes                                | Accepted                  |
| [0040](0040-safe-headers-and-inline-preview-for-file-content.md)    | Safe headers and inline preview for file content                                                 | Accepted                  |
| [0041](0041-files-trash-purge-worker.md)                            | Files trash, purge and the retention worker                                                      | Accepted                  |
| [0042](0042-upload-progress-transport.md)                           | Upload progress uses an injected XHR transport, and the upload queue lives in memory             | Accepted                  |
| [0043](0043-confirmed-cross-owner-move-in-the-web-app.md)           | The web app allows a cross-owner move after an explicit confirmation                             | Accepted                  |
