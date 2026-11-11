# @offgrid/calendar

Purpose: shared and personal calendars and events. Calendars can be listed, created, renamed, recolored and deleted; events come in later issues.
Public API: only what `src/index.ts` exports (`calendarModule`); never import from `src/` internals.
Owner: module team (calendar)

## Schema and role

- Schema `calendar`, owned by the migration role `offgrid_migrator`. The runtime role `offgrid_app` has DML on its tables ([ADR 0017](../../docs/adr/0017-shared-database-roles-and-prisma-migrate.md)). The schema is created by the init scripts in `infra/init/sql`.
- Every table uses the `family-or-user` scope ([ADR 0009](../../docs/adr/0009-table-ownership-scopes.md)): each row has exactly one of `family_id` or `user_id`, and RLS keys on `app.family_id` or `app.user_id`.
- `calendar.calendar`: named calendars with a `color` from the palette in `src/domain/calendar-colors.ts`. Each user has one default calendar (`is_default`, created when the user is created and never deleted). Users created before this change have no default calendar.
- Family calendars can be created, renamed, recolored and deleted by any family member, as ADR 0021 gives members rights over family-shared entities. Policies on `calendar.calendar`, `calendar.calendar_event`, `calendar.event_guest` and `calendar.event_reminder` check `calendar.family_membership`.
- `calendar.calendar_event`: events in one calendar, with `starts_at` and `ends_at`.
- `calendar.event_guest`: guests invited to an event, keyed by `(event_id, guest_user_id)`.
- `calendar.event_reminder`: reminders of an event.
- `calendar.family_membership`: which people belong to each family, fed by family events.
- `calendar.location`: named places.

Migrations live in [packages/db/prisma/migrations](../../packages/db/prisma/migrations) as `*_calendar_init`, `*_calendar_color_and_default` and `*_calendar_family_membership`.

## Routes

`GET /calendars`, `POST /calendars`, `PATCH /calendars/:id` and `DELETE /calendars/:id`, in `src/http/`. The use cases in `src/application/calendars/` run in the caller's user context, and row-level security decides what the caller can see and change. A calendar the caller cannot see answers not-found. Deleting the default calendar answers 409 `DEFAULT_CALENDAR`. Deleting a calendar removes its events, guests and reminders, and publishes `calendar-event-removed-v1` for each event in the same transaction.

## Events

`src/events/default-calendar` subscribes to `user-created-v1` (from identity) and creates the user's default calendar. The insert is idempotent, so a repeated event creates nothing.

`src/events/family-membership` subscribes to `family-member-added-v1` and `family-member-removed-v1` and keeps `calendar.family_membership` in step. That table is how the calendar module knows which family calendars a person may manage. Each family creator also gets a `family-member-added-v1` event, so the creator appears in the table too. Families created before that change have no rows here, so their members cannot manage family calendars until those rows are backfilled.

## Tests

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
