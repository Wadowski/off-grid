# 0030. Calendar reminders: user-owned rows, one claim function for the worker

- **Status:** Accepted

## Context

A person can ask for one or more reminders before an event starts (OG-90). A reminder must fire once at its time, must not depend on a client being connected, and must reach the inbox through the notifications module ([ADR 0026](0026-notifications-map-domain-facts.md)). A reminder is private to the person who set it. A family member or guest must not see another person's reminders.

Row-level security ([ADR 0029](0029-event-guest-access.md)) lets each user read their own data. A background worker has no user, so it cannot read due reminders for all users through those policies. The worker must still claim each reminder exactly once when several server instances run, and must not read more than the reminder ids it needs.

## Decision

- We will store one row in `calendar.event_reminder` per event, creator and offset. Each row is user-owned: `family_id` is NULL and `user_id` names the creator, which the owner-scope check requires. Its state is `fired_at` (set when claimed) or `skipped_at` (set when the time was already past at set or reschedule time).
- We will replace the family-wide reminder policy with an owner policy. A user reads, writes and changes only their own reminder rows. Deleting an event's reminders is allowed to anyone who can write the event's calendar, so that deleting an event also removes guests' reminders.
- We will add `calendar.claim_due_reminders(now, batch)`, a `SECURITY DEFINER` function owned by the migration role. It atomically sets `fired_at` on due rows with `FOR UPDATE SKIP LOCKED`, and returns only `reminder_id`, `event_id` and `user_id`. It does not return titles, times or locations. It claims a row only when `calendar.user_can_see_event(user_id, event_id)` holds, so a removed family member's reminders never fire. The function is `REVOKE`d from `PUBLIC` and granted to the application role only. It is the only cross-user read the worker makes.
- We will run the claim and the publish of `calendar-reminder-due-v1` in one transaction per tick. A rollback leaves no fired marker and no fact, so the next tick retries.
- We will publish the fact owned by the creator, with payload `{ eventId, userId }` only. Notifications maps it to an `event-reminder` item for that user.
- We will run the worker as an interval loop in the server process. It does not use the client connection, so reminders do not depend on the tunnel.
- The worker reads the real time at each tick and every event write uses the real time at the request. There is no server clock abstraction and no test-only clock route, switch or image. Timing is tested with explicit times in the tick and worker tests.

## Consequences

- Easier: the database enforces privacy for reads and writes, and the worker's cross-user access is one narrow function that returns ids only. Two instances cannot fire the same reminder, because the claim is row-locked. Each reminder fires once, including after downtime.
- Harder: the claim function is a documented exception to the owner policy and must be reviewed with each change to the reminder tables. Its visibility check repeats the event-visibility rules in SQL, so a change to those rules must update `calendar.user_can_see_event` too.
- Known gap: when an event moves, only the editing user's reminders are rescheduled. A guest's reminders on that event keep their old times until the guest sets them again. Rescheduling them needs a second cross-user write, which is not included.
- Known gap: removing a family member does not delete their reminder rows. The claim skips them, so they never fire, but the rows remain until the event or the member is removed.
- Known gap: reminder timing is not covered by an end-to-end scenario, because the e2e stack cannot advance the server clock. The tick integration tests and worker unit tests cover the claim, skip and retry rules.
- Follow-up: the reminder controls in the event modal need a design before they are built (OG-90 is API only).
