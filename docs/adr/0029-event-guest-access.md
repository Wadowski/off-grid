# 0029. Event guests read through row-level security and cannot write

- **Status:** Proposed

## Context

The host of a personal event may invite a family member as a guest. The guest should see that one event, read-only, in their own calendar views, and nothing else from the host's calendar. [ADR 0013](0013-projections-for-other-modules-only.md) says a module reads its own data directly, and guest data and events both belong to the calendar module. A copy of each event for the guest would duplicate the data without a second owner.

Row-level security already decides what each user sees. Owner policies match the owner, and family policies match family members. A guest matches neither, so a guest needs an extra read path and must not gain a write path through the existing policies.

## Decision

- We will give guests a read path through additional, `SELECT`-only policies on `calendar.calendar_event`, `calendar.calendar` and `calendar.event_guest`. A guest sees an event when a `calendar.event_guest` row names them and the guest still shares a family with the host recorded on that row, and sees the calendar only through such an event. A guest who leaves the family loses this read access at once. No copy of the event is made.
- We will deny guest writes by absence of a write policy. The use cases also check for a guest row before writing, so a guest gets `403 FORBIDDEN` rather than the `404` used for hidden rows.
- We will tighten the existing owner and family insert checks on `calendar.event_guest`. Each insert must name an event the caller can already see, checked through a `SECURITY DEFINER` function. Without this, a guest could insert a row naming themself as owner and read any event. The same kind of function checks that the caller owns the calendar on `calendar.calendar_event` inserts.
- We will allow an invite only to a family member: the host and the invitee must share a family, and family-owned events cannot be shared this way. Refusals return one fixed `400 VALIDATION_FAILED` message, so the response does not reveal whether an account exists.
- The invite publishes `calendar-event-guest-invited-v1` in the same transaction as the guest row, only when a new row is written. The notifications module maps it to an `event-invited` notice ([ADR 0026](0026-notifications-map-domain-facts.md)).

## Consequences

- Easier: a guest reads the event with the same query path as everyone else, and the database enforces what a guest can see.
- Harder: each new write policy on these tables must be checked against guest access. The isolation tests in `modules/calendar/src/infrastructure/isolation.integration.test.ts` cover the guest cases.
- Known gap: a family member can still write a row into another family's calendar through the existing family policy, because that policy does not check the calendar. This predates guests and is not changed here.
- Follow-up: the invite picker and the guest's read-only event screen need design before they are built.
