# 0012. Event delivery is not tenant-filtered; publishing is limited to module roles

- **Status:** Accepted

## Context

[0011](0011-restricted-event-access-and-retention.md) limits who reads the event stream to the bus role, and runs each subscriber's handler as its module role. It does not say whether delivery is filtered by family or user, or who may publish.

A review of the outbox found two gaps. First, the bus reads events by type across all families and users, so a subscriber receives every committed event of the types it subscribes to. Second, `outbox.append_event` accepted any family or user id from any caller, so a module could publish an event for another family.

## Decision

- We will deliver events without tenant filtering. The bus is part of the server process, and its subscribers are first-party module code. Each subscriber receives every committed event of the types it subscribes to.
- We will require each subscriber to check ownership with `packages/access-control` before it acts on data, and to store only the fields it needs.
- We will limit publishing to module app roles. `outbox.append_event` refuses any caller whose session user does not end in `_app` (migration `0002_publish_authority.sql`).
- We will keep event type ownership as a convention checked in review: a module publishes the event types it owns. We will not add a database registry of types in this change.
- Any external transport must filter by tenant before it sends an event out of the process. That rule is part of the transport contract in [0011](0011-restricted-event-access-and-retention.md).

## Consequences

- A subscriber that skips the ownership check can leak one tenant's data to another. Review must check every new subscriber.
- A module that publishes another module's event type is not blocked by the database. The review checklist covers this.
- The publish check does not stop one module's role from publishing as another module's data, since any `_app` role may publish any `family_id` or `user_id`. Stronger control needs a type registry, which is follow-up work.
- Adding a broker or other transport needs tenant filtering in its adapter before the first release.
