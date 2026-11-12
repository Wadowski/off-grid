# 0028. Calendar events: UTC bounds fixed at write time, per-user zone, one source version per event row

- **Status:** Proposed

## Context

Calendar events have timed and all-day forms. A timed event is a pair of instants. An all-day event covers whole calendar days, and a day depends on the zone of the person who reads it. The calendar module must store events so that any reader can order and filter them without knowing every writer's zone.

Projections in other modules keep a copy of each event row and apply changes by `sourceVersion` ([ADR 0002](0002-outbox-events-and-projections.md), [ADR 0011](0011-restricted-event-access-and-retention.md)). A projection needs a version that is unique and ordered per event, including for removals, so that a late update cannot bring back a removed event.

Two designs were rejected. Storing local dates plus a zone on every event adds a second representation that every reader must handle. Recomputing all-day bounds whenever a person changes zone rewrites data that other people may already have read.

## Decision

We will store every event's bounds as UTC instants. For an all-day event, the server converts the requested dates to instants with the caller's time zone when the event is written, and stores `is_all_day` so readers know the kind. The bounds are not recomputed when the caller changes zone.

We will keep the time zone per user in `calendar.user_time_zone`, with scope `user`. A user with no row uses UTC, and the API reports that the zone is not set.

We will keep a `version` on each `calendar_event` row. It starts at 1 and is incremented in the same statement that writes the change. Each published event carries the row's new version as its `sourceVersion`. A removal publishes `version + 1` of the deleted row, so it sorts after the last update. A calendar removal does the same for each event it deletes.

We will refuse a PATCH that would move an event to a calendar with a different owner. The target calendar must be visible to the caller.

## Consequences

- Readers order and compare events by UTC instants and never need the writer's zone.
- An all-day event keeps its day boundaries after its writer changes zone. A later PATCH that changes only one date recomputes that bound with the caller's zone, so the two bounds may then use different zones. This is accepted for now.
- Removal events change from `sourceVersion` 1 to `version + 1`. No projection exists yet, so no consumer breaks.
- The `calendar-event-removed-v1` payload is unchanged, since it is a released version.
- Event titles, locations and descriptions are copied into outbox rows. Those copies stay until a prune job exists ([ADR 0011](0011-restricted-event-access-and-retention.md)). The privacy statement says so.
- Follow-up work: a prune job for delivered outbox rows, and a decision on whether a zone change should rewrite all-day bounds.
