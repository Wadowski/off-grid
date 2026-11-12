# @offgrid/calendar

Purpose: shared and personal calendars and events. Calendars can be listed, created, renamed, recolored and deleted. Events can be listed, created, read, updated, moved between calendars of the same owner, and deleted. Calendar views and recurrence come in later issues.
Public API: only what `src/index.ts` exports (`calendarModule`); never import from `src/` internals.
Owner: module team (calendar)

## Schema and role

- Schema `calendar`, owned by the migration role `offgrid_migrator`. The runtime role `offgrid_app` has DML on its tables ([ADR 0017](../../docs/adr/0017-shared-database-roles-and-prisma-migrate.md)). The schema is created by the init scripts in `infra/init/sql`.
- Every table uses the `family-or-user` scope ([ADR 0009](../../docs/adr/0009-table-ownership-scopes.md)): each row has exactly one of `family_id` or `user_id`, and RLS keys on `app.family_id` or `app.user_id`.
- `calendar.calendar`: named calendars with a `color` from the palette in `src/domain/calendar-colors.ts`. Each user has one default calendar (`is_default`, created when the user is created and never deleted). Users created before this change have no default calendar.
- Family calendars can be created, renamed, recolored and deleted by any family member, as ADR 0021 gives members rights over family-shared entities. Policies on `calendar.calendar`, `calendar.calendar_event`, `calendar.event_guest` and `calendar.event_reminder` check `calendar.family_membership`.
- `calendar.calendar_event`: events in one calendar, with `starts_at` and `ends_at` (UTC), `is_all_day`, `title`, `location` and `description` (both nullable), and `version`, which starts at 1 and is incremented on every change.
- `calendar.user_time_zone`: the IANA time zone each user set, with scope `user`. A user with no row is treated as UTC, and `GET /calendar/time-zone` reports `isSet: false`.
- `calendar.event_guest`: guests invited to an event, keyed by `(event_id, guest_user_id)`.
- `calendar.event_reminder`: reminders of an event.
- `calendar.family_membership`: which people belong to each family, fed by family membership events. A removed membership stays as a row with `is_member = false` and the newest `source_version` applied, so an older join cannot bring it back.
- `calendar.location`: named places.

Migrations live in [packages/db/prisma/migrations](../../packages/db/prisma/migrations) as `*_calendar_init`, `*_calendar_color_and_default`, `*_calendar_family_membership`, `*_calendar_events` and `*_calendar_user_time_zone`.

## Routes

`GET /calendars`, `POST /calendars`, `PATCH /calendars/:id` and `DELETE /calendars/:id`, in `src/http/`. The use cases in `src/application/calendars/` run in the caller's user context, and row-level security decides what the caller can see and change. A calendar the caller cannot see answers not-found. Deleting the default calendar answers 409 `DEFAULT_CALENDAR`. Deleting a calendar removes its events, guests and reminders, and publishes `calendar-event-removed-v1` for each event in the same transaction.

## Event routes and rules

`GET /calendars/:id/events` and `POST /calendars/:id/events` list and create events in one calendar. `GET /events/:id`, `PATCH /events/:id` and `DELETE /events/:id` read, change and remove one event. `GET /calendar/time-zone` and `PUT /calendar/time-zone` read and set the caller's zone. The use cases are in `src/application/calendar-events/` and `src/application/time-zone/`, and the routes are in `src/http/`.

- A timed event sends `startsAt` and `endsAt` (ISO 8601 with an offset). An all-day event sends `startDate` and `endDate` (`YYYY-MM-DD`, inclusive). The server converts all-day dates to UTC bounds with the caller's zone, when the event is written.
- The end may not be before the start, after the merge with stored values. A refusal answers 400 `VALIDATION_FAILED` with a fixed message, never the title.
- A PATCH may send only one bound. The other bound comes from the stored event. Sending the other kind of timing switches the event to that kind. Sending both kinds in one request answers 400.
- `location` and `description` accept `null` to clear the field. Omitting the field keeps it.
- A PATCH with `calendarId` moves the event only to a calendar of the same owner. A different owner answers 409 `EVENT_MOVE_OWNER_MISMATCH` and nothing is written. A target calendar the caller cannot see answers 404.
- Create, update, move and delete publish their event in the same transaction as the change, so a rollback leaves no row and no outbox row.

Decision record: [ADR 0028](../../docs/adr/0028-calendar-event-time-and-versions.md).

## Events

`calendar-event-created-v1` and `calendar-event-updated-v1` carry the full state of the event after the change, so a projection can upsert it. Their payload holds `title`, `location` and `description`. Their envelope `sourceVersion` is the row's `version`. `calendar-event-removed-v1` carries only `eventId` and `calendarId`, and its `sourceVersion` is the deleted row's `version + 1`. Outbox rows keep these copies until a prune job exists, which is not built yet ([privacy statement](../../docs/privacy.md)).

`src/events/default-calendar` subscribes to `user-created-v1` (from identity) and creates the user's default calendar. The insert is idempotent, so a repeated event creates nothing.

`src/events/family-membership` subscribes to `family-member-added-v1` and `family-member-removed-v1` and keeps `calendar.family_membership` in step. That table is how the calendar module knows which family calendars a person may manage. Each family creator also gets a `family-member-added-v1` event, so the creator appears in the table too. Families created before that change have no rows here, so their members cannot manage family calendars until those rows are backfilled.

Each change is applied in the order the family made it. A change that was already applied is ignored. A change that arrives before an earlier change it depends on halts the subscriber until that change arrives. A person whose earlier change was made before this projection existed is denied until their next change applies. The projection starts after the events that existed at migration time, so those old events are never replayed.

Both events go to one subscription, `calendar-family-membership`, so they are applied in the order the family made them, even when a removal and a later rejoin are delivered together. The subscription uses the bus's `halt` failure policy: an event that still fails after its retries stops the subscriber there, rather than being skipped. Later events wait until the failure is fixed, and the error is recorded.

Known gap: while the subscriber is halted, the stored state stays as the last applied change left it. If that change was a join that was never followed by its removal, the person keeps access until the failure is fixed. Denying access while the projection is halted needs a health signal that the policies can check, and it is not built yet.

## Tests

`src/events/calendar-events/calendar-events-replay.integration.test.ts` replays one event's changes through `replayEvents` and checks that `sourceVersion` runs 1 to 5 across create, updates, a move and a removal, and that a refused cross-owner move publishes nothing.

`src/infrastructure/isolation.integration.test.ts` runs against a real Postgres. It checks that calendar rows are visible only inside their own family or user context, and that a row with both owners is refused.

Cross-schema reads are not blocked by the database, since `offgrid_app` can use every schema. The module boundary is enforced by `pnpm check:boundaries` and by code review.

## Layout

```
src/calendar-module.ts   the module descriptor
src/index.ts             re-exports only
src/domain/              pure rules (empty)
src/application/         use cases (empty)
src/infrastructure/      queries and tests against the calendar schema
src/http/                routes (empty)
src/events/              events published and handled (empty)
src/workers/             background jobs (empty)
test/                    Postgres harness for the module's tests
```
