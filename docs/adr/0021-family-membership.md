# 0021. Family membership: two roles, single-use invitation codes, one admin minimum

- **Status:** Proposed

## Context

Offgrid shares data by family and by access group, as set out in the "Offgrid: Architecture Handoff for Initial Implementation" document in Claude Docs. A person can belong to several families, and every person also has a personal access group that no one else can read. Session and family-context rules are set by [ADR 0016](0016-local-authentication-model.md).

The family module, invitations and access groups all need one agreed model before they are built. Four questions are open:

- Which roles exist inside a family, and what each may do.
- How a person joins: the form of the invitation, who may issue it, how long it lasts, and whether it can be used more than once.
- How one person can belong to several families, and how that relates to the personal access group.
- Whether a family must always keep an admin.

Constraints that shape the choice:

- Access control is never feature-gated (see [CLAUDE.md](../../CLAUDE.md)). Membership and role checks cannot depend on plan limits.
- The server runs on a home network with no required mail. An invitation must work without outgoing mail (see [ADR 0018](0018-outgoing-mail-to-a-chosen-provider.md)).
- Invitation codes are secrets. They are stored only as hashes and never logged (see [.claude/rules/security-privacy.md](../../.claude/rules/security-privacy.md)).
- Ownership of rows follows [ADR 0009](0009-table-ownership-scopes.md). The handoff's "family_id on every row" is superseded by that record, so membership rows are scoped to a family, not to a user.

Options considered for roles:

- **Owner, admin and member.** Adds a role that only one person holds and that duplicates admin for a household. Rejected.
- **Admin and member.** Two roles cover the household case, and the admin rights are a small, checkable set. Chosen.
- **Per-permission flags on each member.** Flexible, but every new feature adds flags to review, and a family of four does not need them. Rejected for now; it can follow as a later record.

Options considered for joining:

- **Join by email invitation.** Needs outgoing mail, which is off by default. Rejected as the only path.
- **Long-lived shared link.** A leaked link adds people for as long as it lives. Rejected.
- **Single-use code with an expiry.** Works without mail, can be revoked, and limits the damage from a leak. Chosen.

## Decision

**Roles**

- A family has two roles: `admin` and `member`.
- The person who creates a family becomes its first admin.
- An admin may rename the family, issue and revoke invitations, remove any member (including another admin), and change any member's role. The last-admin rule below limits this.
- A member may read the family's shared data, create family-shared entities, leave the family, and manage their own private data. A member may not remove or change the role of anyone else.

**Invitations**

- An admin creates an invitation. It is a random code of at least 128 bits. The admin screen shows it once, and the server keeps only its hash, so the plain code cannot be shown again.
- The invitation is single use. The first person who accepts it becomes a member with the `member` role. Accepting consumes the code in one conditional update that succeeds only while the code is unused, unexpired and unrevoked, so two concurrent accepts cannot both succeed.
- A used, expired, revoked or unknown code all get the same generic reply, so a code's state is not revealed.
- An invitation expires seven days after it is created. An admin may revoke an unused invitation at any time.
- Code entry is rate limited per account and per client address, as sign-in is ([ADR 0016](0016-local-authentication-model.md)).
- The code is hashed with SHA-256. A code has 128 random bits, so a slow password hash is not needed, and Argon2id does not apply. The hash cannot be reversed to the code, and lookup is an exact match on an indexed column.
- Codes and their hashes never appear in logs, traces, outbox event payloads ([ADR 0011](0011-restricted-event-access-and-retention.md)) or error records ([ADR 0020](0020-error-records-in-postgres.md)).
- The hash is compared in constant time.
- The code is entered on the Join Family Space screen. A link that carries the same code may be added later; it is not part of this record.
- An invitation does not grant a role above `member`. Admin rights are given only by an admin changing a role after the person has joined.
- Joining requires a signed-in account. Disabling an account revokes its sessions ([ADR 0016](0016-local-authentication-model.md)), so a disabled account has no session with which to join.

**Several families**

- A person may belong to any number of families. Each membership is one row in the family module's membership table, with its own role.
- A session still identifies the user only. The client names the active family on each request, and the server checks current membership, as [ADR 0016](0016-local-authentication-model.md) already sets out.
- The personal access group is not a family. It exists for every user, cannot be shared, and is not counted as a membership.

**At least one admin**

- A family must always have at least one admin. The server refuses any change that would leave a family with no admin: removing the last admin, demoting the last admin, or the last admin leaving.
- The last admin must first promote another member, or the family is ended in a later record. This record does not define ending a family.
- The last-admin check and the change run in one transaction that locks the family's membership rows, so two concurrent changes cannot leave a family without an admin.

**Ownership and boundaries**

- The membership table uses the **family** scope of [ADR 0009](0009-table-ownership-scopes.md): each row has a non-null `family_id`, and row-level security limits access to that family's members. The family module reads its own tables directly, as [ADR 0013](0013-projections-for-other-modules-only.md) allows.
- The invitation table also uses the family scope, but only admins of that family may read its rows. Members have no read access to invitation rows, even though they share the family scope.
- **Exception for accepting an invitation.** A joiner is not yet a member, so the family-scope read policy would hide the invitation row they need. Accepting therefore uses two policies on the invitation table that are keyed on one value the transaction sets: the code hash, `app.invitation_code_hash`. The read policy shows only a row whose code hash matches and that has not expired. The update policy lets the joiner set `used_by`, `used_at` and `revoked_at` on that row, only while it is unused, unrevoked and unexpired, and only to themselves, with `used_at` set and `revoked_at` empty. The database role may update only those three columns. The joiner cannot read any other invitation row, and this is the same keyed-policy pattern as the session lookup in [ADR 0016](0016-local-authentication-model.md). This is an exception to the family-scope rule of [ADR 0009](0009-table-ownership-scopes.md), recorded here; ADR 0009 is not edited.
- Invitation codes are stored in a table of their own in the family module. Their hashes are never sent to the client after creation.
- Identity keeps the read-only projection of current memberships described in [ADR 0016](0016-local-authentication-model.md). Membership changes are published as events under the event rules of [ADR 0011](0011-restricted-event-access-and-retention.md) and [ADR 0014](0014-subscriber-handlers-on-module-logins.md). A join publishes `family-member-added-v1` with `{ userId, role }` in the same transaction as the membership row, using the `<entity>-<action>-v1` naming and zod schemas in `packages/contracts`.
- Role checks are added to `packages/access-control` alongside its resource grants.
- Membership, roles and invitations are never feature-gated. The family module never imports the entitlements or billing modules.

## Consequences

- Joining works on a server with no mail configured. A code stops working after its first acceptance, so a leaked code can be used once, by whoever accepts first.
- The two-role model is easy to check and to test. Permission checks live in `packages/access-control`, so every module asks the same question.
- A household with no second admin cannot lose its only admin by accident: the server refuses the change.
- Per-permission roles, email invitations and invitation links are not built. Each needs its own record if it is wanted.
- Removed members keep access until the identity projection catches up. In normal operation that takes a few seconds on a local server, as [ADR 0016](0016-local-authentication-model.md) already accepts, but outbox retries can delay it longer. The bound is best effort, not a guarantee. This is an explicitly accepted risk for removal. A removal that must take effect at once needs its own record.
- A later invitation link must keep the code out of any URL path or query string, since servers and referrers log those. It needs its own record.
- Follow-up issues for members, invitations and access groups must reference this record.
- Owner acceptance is pending. Until the owner accepts this record, the status stays `Proposed`.
