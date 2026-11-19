# @offgrid/family-projection

Purpose: the shared part of each module's local copy of family membership. It holds the version check, the mapping from `family-member-added-v1` and `family-member-removed-v1` to a membership change, the handler, and the subscription definition.
Public API: only what `src/index.ts` exports; never import from `src/` internals.
Owner: platform team

## Use

- A module supplies a `FamilyMembershipStore`: `findStored` reads its own row, and `write` upserts it. Both take the module's transaction.
- `createFamilyMembershipHandler(store)` returns the handler. `familyMembershipSubscriptionOf(moduleName)` gives the subscriber name (`<module>-family-membership`), the events and `runAs`, with `onFailure: "halt"`.
- `applyMembershipChange(tx, change, store)` sets the row for one change, through `applyMembershipVersion`.

## Rules

- A duplicate or stale version is skipped. A gap on an existing row throws `MembershipChangeOutOfOrderError`. A first event that is not version 1 stores `isMember: false`.
- A membership event with no family is refused.
- The package has no module code and no I/O of its own. Each module's table access is passed in as the store.
