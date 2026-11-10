# 0022. Active family per session, and personal groups in the request context

- **Status:** Proposed

## Context

[ADR 0021](0021-family-membership.md) says a session identifies the user only, and that the client names the active family on every request. OG-69 asks for an API to switch the active family for a session, and for each request to run with the right access groups.

Access groups are not stored as rows yet. [packages/access-control](../../packages/access-control/README.md) leaves persistence to the `access` module, which is still a stub. Until then, a group id can be derived: a personal group is the user's id, and a family group is the family's id.

## Decision

- A signed-in request runs with the personal group (the user's id) and, when a family is active, the family group (the family's id). The personal group is always present, so a person's own data stays visible to them in any family context.
- The active family is chosen in one of two ways, in this order:
  1. An `x-offgrid-family-id` header on the request. The server checks membership on every request, as before.
  2. Otherwise, the family selected for the session with `PUT /api/families/active`. The selection is stored in `family.active_family`, keyed by session id, under the user scope of [ADR 0009](0009-table-ownership-scopes.md).
- The selection cannot name a family the user is not a member of. Removing a membership deletes the selection through a foreign key to `family.family_member`, so a removed member is not left with an active family.
- The switch endpoint lives in the family module, which owns the selection table. The server reads it through the family module's public entry point, as it already does for the membership list.

## Consequences

- A client can switch family once per session and omit the header afterwards. Clients that send the header are unaffected.
- The family module now holds per-session state. Rows for expired sessions are not pruned yet. A later job must delete rows whose session has ended, as [ADR 0019](0019-state-shared-between-instances.md) requires for shared state.
- Persisting access groups as rows, and granting access to them, stays with the `access` module. This record does not change that.
- ADR 0021's statement that a session identifies only the user is superseded for the active family by this record. ADR 0021 itself is not edited, because it is still Proposed; its owner acceptance is pending.
