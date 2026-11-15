# @offgrid/calendar

Purpose: shared and personal calendars and events. Calendars can be listed, created, renamed, recolored and deleted. Events can be listed, created, read, updated, moved between calendars of the same owner, and deleted. Events can also be read by view (agenda, day, week, month). Recurrence comes in later issues.
Public API: only what `src/index.ts` exports (`calendarModule`); never import from `src/` internals.
Owner: module team (calendar)

## Schema and role

- Schema `calendar`, owned by the migration role `offgrid_migrator`. The runtime role `offgrid_app` has DML on its tables ([ADR 0017](../../docs/adr/0017-shared-database-roles-and-prisma-migrate.md)). The schema is created by the init scripts in `infra/init/sql`.
- Every table uses the `family-or-user` scope ([ADR 0009](../../docs/adr/0009-table-ownership-scopes.md)): each row has exactly one of `family_id` or `user_id`, and RLS keys on `app.family_id` or `app.user_id`.
- `calendar.calendar`: named calendars with a `color` from the palette in `src/domain/calendar-colors.ts`. Each user has one default calendar (`is_default`, created when the user is created and never deleted). Users created before this change have no default calendar.
- Family calendars can be created, renamed, recolored and deleted by any family member, as ADR 0021 gives members rights over family-shared entities. Policies on `calendar.calendar`, `calendar.calendar_event` and `calendar.event_guest` check `calendar.family_membership`. `calendar.event_reminder` is private to its creator instead ([ADR 0030](../../docs/adr/0030-calendar-reminder-dispatch.md)).
- `calendar.calendar_event`: events in one calendar, with `starts_at` and `ends_at` (UTC), `is_all_day`, `title`, `location` and `description` (both nullable), and `version`, which starts at 1 and is incremented on every change.
- `calendar.user_time_zone`: the IANA time zone each user set, with scope `user`. A user with no row is treated as UTC, and `GET /calendar/time-zone` reports `isSet: false`.
- `calendar.event_guest`: guests invited to an event, keyed by `(event_id, guest_user_id)`.
- `calendar.event_reminder`: one row per reminder, for an event, its creator and an offset in minutes. Holds `fired_at` and `skipped_at`. See Reminders below.
- `calendar.family_membership`: which people belong to each family, fed by family membership events. A removed membership stays as a row with `is_member = false` and the newest `source_version` applied, so an older join cannot bring it back.
- `calendar.location`: named places.

Migrations live in [packages/db/prisma/migrations](../../packages/db/prisma/migrations) as `*_calendar_init`, `*_calendar_color_and_default`, `*_calendar_family_membership`, `*_calendar_events`, `*_calendar_user_time_zone` and `*_calendar_event_range_index`. The last one adds the `(starts_at, ends_at)` index that the view query uses. `*_calendar_event_guests` and `*_calendar_event_reminders` follow.

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
- `reminderOffsetsMinutes` on create and PATCH sets the caller's own reminders: up to 5 distinct whole offsets from 0 to 40320 minutes. `[]` clears them, and omitting it keeps them. The response carries the caller's offsets (`reminderOffsetsMinutes`). A PATCH that sends only `reminderOffsetsMinutes` changes no event field and publishes nothing, so a guest may use it for their own reminders.

Decision record: [ADR 0028](../../docs/adr/0028-calendar-event-time-and-versions.md).

## Guests

`POST /events/:id/guests` invites a family member to a personal event the caller hosts, with body `{ guestUserId }`. It answers 201 for a new guest and 200 when the guest is already invited, with the same body in both cases. The use case is `src/application/event-guests/invite-event-guest.ts`, and the route is `src/http/calendar-events/register-invite-event-guest.ts`.

- The invitee must share a family with the host. An event that belongs to a family, the host as invitee, and an invitee who shares no family all answer 400 `VALIDATION_FAILED` with one fixed message.
- A guest reads the event through `GET /events/:id`, `GET /calendars/:id/events` and the views, with `readOnly: true`, `calendarName` and `calendarColor`. The guest sees only the events they were invited to, never the rest of the host's calendar. The guest's read path is the SELECT-only policies in migration `20261119000000_calendar_event_guests`.
- A guest who sends `PATCH /events/:id`, `DELETE /events/:id` or an invite answers 403 `FORBIDDEN` with a fixed message, and the stored row is unchanged.
- Guest removal is not built. A guest keeps access after they leave the family, which is a known gap in [ADR 0029](../../docs/adr/0029-event-guest-access.md).
- The UI for inviting guests is a follow-up. The event details screen shows a guest the event read-only: the edit and delete controls are not rendered when `readOnly` is true. The server still enforces every write.

Decision record: [ADR 0029](../../docs/adr/0029-event-guest-access.md).

## Views

`GET /calendar/views/:view?date=YYYY-MM-DD`, with `view` one of `agenda`, `day`, `week` or `month`, in `src/http/views/`. The use case is `src/application/views/list-calendar-view.ts`. `date` is required, because the server cannot know the caller's local today without a zone.

- The range is in the caller's local days, from `calendar.user_time_zone` (UTC when unset). `day` is `date`. `agenda` is the 7 days starting on `date`. `week` is the ISO week (Monday to Sunday) that contains `date`. `month` is the days of the calendar month of `date`, and the client builds its own grid. Range bounds come from `localMidnight`, so a 23-hour or 25-hour DST day is kept whole.
- The response is `{ view, startDate, endDate, days }`, where `days` has one entry per local date in the range, in order. Each event is listed under every day it overlaps, so a multi-day event repeats.
- An event overlaps the range when it starts before the range ends and either ends after the range starts or starts at or after it. An event that ends exactly at the range start is not listed, and an event that starts exactly at the range end is not listed. A zero-length event is listed on the range that contains its instant.
- Each event carries `calendarName` and `calendarColor`. The query runs in the caller's user context, so row-level security decides which calendars are visible, and a calendar the caller cannot see is not listed.
- A bad `view` or `date` answers 400 `VALIDATION_FAILED` with a fixed message.

## Events

`calendar-event-created-v1` and `calendar-event-updated-v1` carry the full state of the event after the change, so a projection can upsert it. Their payload holds `title`, `location` and `description`. Their envelope `sourceVersion` is the row's `version`. `calendar-event-removed-v1` carries only `eventId` and `calendarId`, and its `sourceVersion` is the deleted row's `version + 1`. `calendar-event-guest-invited-v1` carries `eventId`, `guestUserId` and `calendarId`, and no title or other personal data. `calendar-reminder-due-v1` carries `eventId` and `userId` only, and no offset or time. Outbox rows keep these copies for the retention period, 7 days by default (`OFFGRID_OUTBOX_RETENTION_DAYS`). The server's prune job deletes an outbox row only after it is older than that period and every registered subscriber has passed it. It does not touch the calendar tables ([privacy statement](../../docs/privacy.md)).

`src/events/default-calendar` subscribes to `user-created-v1` (from identity) and creates the user's default calendar. The insert is idempotent, so a repeated event creates nothing.

`src/events/family-membership` subscribes to `family-member-added-v1` and `family-member-removed-v1` and keeps `calendar.family_membership` in step. That table is how the calendar module knows which family calendars a person may manage. Each family creator also gets a `family-member-added-v1` event, so the creator appears in the table too.

Each change is applied in the order the family made it. A change that was already applied is ignored. A change that arrives before an earlier change it depends on halts the subscriber until that change arrives. The projection starts after the events that existed at migration time, so those old events are never replayed.

Both events go to one subscription, `calendar-family-membership`, so they are applied in the order the family made them, even when a removal and a later rejoin are delivered together. The subscription uses the bus's `halt` failure policy: an event that still fails after its retries stops the subscriber there, rather than being skipped. Later events wait until the failure is fixed, and the error is recorded.

A removal ends access within a bound, not at once. The bus polls the outbox every second by default (`DEFAULT_POLL_INTERVAL_MS`), so a removal is applied within one poll interval after its outbox row is written. If the handler fails, the retry backoff adds to that bound (100 ms, doubling on each attempt, by default). A removed member can read until the removal is applied. A halted subscriber has no bound and applies nothing until the failure is fixed.

To rebuild `calendar.family_membership`, truncate it and replay `family-member-added-v1` and `family-member-removed-v1` together with `replayEvents`, using the `events` form, with `familyMembershipHandler` applied to each event (`(event) => familyMembershipHandler(db, event)`). Replay reads the retained events in sequence order and applies each one through the same function as live delivery, so the rebuilt rows match the live rows. Replay reads only events still in the outbox, so a rebuild cannot restore a membership whose events were pruned after the retention period.

Known gap: while the subscriber is halted, the stored state stays as the last applied change left it. If that change was a join that was never followed by its removal, the person keeps access until the failure is fixed. Denying access while the projection is halted needs a health signal that the policies can check, and it is not built yet.

## Reminders

A reminder fires a fixed number of minutes before the event's start. Each person may set up to five per event, and each is one row for (event, creator, offset). Rows are private to their creator: no other family member and no guest sees them.

- A row is due at `remind_at = startsAt - offset`, inclusive. Setting or moving a reminder into the past sets `skipped_at`, so it never fires. A reminder that becomes due while the server is down fires once, at the next tick.
- A change to the event's start, end or all-day window reschedules the editing user's rows, keeping `fired_at` only when the time is unchanged. Moving a reminder into the future after it fired fires it again at the new time. Clearing or adding offsets adds or removes rows.
- Deleting an event removes all its reminder rows, including guests' rows, so none fires after the event is gone.
- The worker (`src/workers/reminder-dispatch/`) runs every 30 seconds in the server process, and skips a tick while the previous one is still running. Each tick claims due rows with `calendar.claim_due_reminders` and publishes `calendar-reminder-due-v1` for each, in one transaction. The claim is row-locked, so two server instances never fire the same row, and it skips rows whose owner can no longer see the event and rows with no user owner.
- The claim is raw SQL, in `src/infrastructure/reminders/claim-due-reminders.ts` with `$queryRaw`. It is the only cross-user read the worker makes. The worker runs outside any user context, so row-level security cannot scope the read, and Prisma cannot call a set-returning function through its model API. The function is `SECURITY DEFINER`, is `REVOKE`d from `PUBLIC`, returns only the three ids, and is reviewed with each change to the reminder tables (ADR 0030).
- `calendar-reminder-due-v1` carries `eventId` and `userId` only. Notifications maps it to an `event-reminder` inbox item for its creator. The fact is not delivered through a calendar-specific channel.
- Known gaps: an event move reschedules only the editing user's rows, so a guest's reminders keep their old times until they set them again. Reminder controls in the event screen are not built (API only).

Decision record: [ADR 0030](../../docs/adr/0030-calendar-reminder-dispatch.md).

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
