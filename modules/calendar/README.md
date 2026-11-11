# @offgrid/calendar

Purpose: shared and personal calendars and events. This is the skeleton: the schema and the module boot in the server. Routes and behaviour come in later issues.
Public API: only what `src/index.ts` exports (`calendarModule`); never import from `src/` internals.
Owner: module team (calendar)

## Schema and role

- Schema `calendar`, owned by the migration role `offgrid_migrator`. The runtime role `offgrid_app` has DML on its tables ([ADR 0017](../../docs/adr/0017-shared-database-roles-and-prisma-migrate.md)). The schema is created by the init scripts in `infra/init/sql`.
- Every table uses the `family-or-user` scope ([ADR 0009](../../docs/adr/0009-table-ownership-scopes.md)): each row has exactly one of `family_id` or `user_id`, and RLS keys on `app.family_id` or `app.user_id`.
- `calendar.calendar`: named calendars with a `color` from the palette in `src/domain/calendar-colors.ts`. Each user has one default calendar (`is_default`, created when the user is created and never deleted).
- `calendar.calendar_event`: events in one calendar, with `starts_at` and `ends_at`.
- `calendar.event_guest`: guests invited to an event, keyed by `(event_id, guest_user_id)`.
- `calendar.event_reminder`: reminders of an event.
- `calendar.location`: named places.

Migrations live in [packages/db/prisma/migrations](../../packages/db/prisma/migrations) as `*_calendar_init` and `*_calendar_color_and_default`.

## Events

`src/events/default-calendar` subscribes to `user-created-v1` (from identity) and creates the user's default calendar. The insert is idempotent, so a repeated event creates nothing.

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
