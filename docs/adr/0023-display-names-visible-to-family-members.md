# 0023. Display names are copied to the family module and shown to people who share a family

- **Status:** Proposed

## Context

A family member list is more useful with names than with ids. The name is owned by the identity module, and the family module may not read identity's tables ([ADR 0002](0002-outbox-events-and-projections.md), [ADR 0009](0009-table-ownership-scopes.md)). Identity publishes `user-created-v1` with the name at sign-up, and a rename has so far published nothing.

[ADR 0009](0009-table-ownership-scopes.md) gives each table one scope: `family-or-user`, `family`, `user` or `shared`. A copy of a person's name must be readable by people who share a family with that person and by no one else. None of the four scopes says that. The `user` scope would hide the name from co-members, and `family` would store one copy per family.

## Decision

- Identity publishes `user-profile-updated-v1` with `{ userId, displayName }` each time a person changes their name. The event's source version is a per-account counter, `display_name_version`, incremented in the same transaction as the change. The sign-up event keeps source version 1.
- The family module keeps one read-only copy of each name in `family.account_name`, keyed by `user_id`. Its consumers apply `user-created-v1` and `user-profile-updated-v1` and use [classifySourceVersion](../../packages/event-bus/src/classify-source-version.ts): an older or repeated version is ignored, and a version that skips ahead is an error that the bus retries.
- The table declares the `user` scope: each row is owned by the person it names. It has row-level security with two rules:
  1. A person may write only their own row.
  2. A person may read their own row, and the row of anyone who shares a family with them.
- The second rule needs membership rows that row-level security hides from the caller. A boolean function, `family.shares_family_with(user_id)`, reads them as the migration owner. It returns only whether the caller shares a family with that person. This is the one `SECURITY DEFINER` function in the family schema, and its body is limited to that check.
- Names are shown only with the family member list. A person who leaves every family they shared with another person stops being visible to that person's former co-members, because the rule is evaluated at read time.

## Consequences

- The `user` scope now has a documented exception: its rows may be read by others who share a family. `assertOwnershipScopes` still passes, since it checks the owner column and row-level security, not the policy body. Reviewers should treat any further exception as a new decision.
- Names are copied once per account, not once per family, so a rename updates one row.
- The family module depends on identity events. Old `user-created-v1` events are delivered from the outbox when the subscriber first runs, so accounts created before the subscriber existed are copied too, as long as their events are not yet pruned.
- A person's name appears in other families' member lists only for people who share a family with them. A name is never sent to a person who shares no family.
- The family module now uses `user-profile-updated-v1`, which identity publishes. Its payload carries the name and the user id and no email address.
