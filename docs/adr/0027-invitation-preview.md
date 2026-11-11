# 0027. Invitation preview: a code shows its family before the person joins

- **Status:** Accepted

## Context

[ADR 0021](0021-family-membership.md) lets a person join a family with a single-use code and does not let a non-member read anything about the family. The Join Family Space design (OG-73) shows the family a code is for, the person who invited, and when the family was created, with accept and decline actions. Showing that before a person joins needs data that a non-member can't read today.

Constraints:

- A code is a secret. Looking at a code must not use it up, and a wrong code must not reveal whether a family exists (ADR 0021).
- Failed lookups count towards the same limit as failed redemptions, so the preview cannot be used to probe codes.
- Access control is never feature-gated (CLAUDE.md).

## Decision

- A new endpoint, `POST /families/invitations/preview`, takes a code and returns the family's id, name and creation time, and the display name of the person who created the invitation, or `null` if that person has no name copy. The member list, member count and roles are not returned.
- The preview does not consume the code, and accepting still goes through `POST /families/join`.
- An unknown, spent, revoked or expired code gets the same generic answer as a failed redemption and counts towards the account's attempt limit (ADR 0021). A person who has already joined the family gets the same answer and does not count, as redemption does. A limited account gets the same rate-limit answer.
- Two additional row-level security policies, keyed on `app.invitation_code_hash` in the same way as the redeem policies in ADR 0021, let the lookup read:
  - the family row, and only while a live invitation with that code hash exists for it;
  - the display-name copy of the invitation's creator, only under the same condition.
- A live invitation is one that is unused, unrevoked and unexpired, and the lookup filters for that explicitly.
- This adds read access to two tables for a person holding a code. It adds no write access and no other column or row. It is an extension of the keyed-policy exception in ADR 0021, recorded here; ADR 0021 is not edited.

## Consequences

- A person with a valid code learns the family's name, its creation date and the inviter's display name before joining. Anyone who holds a code can already join, so this does not widen who can enter the family.
- A person who only guesses codes learns nothing from the preview, because wrong codes get the same answer and count towards the limit.
- The design's member count and governance text are not shown: the first needs member rows a non-member cannot read, and the second makes claims the product does not yet back.
- The preview runs under the same transaction rules as redemption, and its integration tests cover spent, revoked, unknown, already-joined and rate-limited codes.
- The family policy is row-level, so it makes every column of `family.family` readable to a code holder. The preview selects only the name and creation time. A column added to `family.family` later must be reviewed against this policy first, and the migration says so.
- The attempt limit is checked and recorded in separate transactions, as redemption is. Parallel requests can therefore exceed the limit slightly. Closing that gap would change redemption as well, so it is left for a later record.
