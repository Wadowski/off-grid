# 0021. Family membership: two roles, single-use invitation codes, and at least one admin per family

- **Status:** Proposed

## Context

Offgrid shares data by family and by access group (see the architecture handoff). A person can belong to several families, and every person also has a personal access group that no one else can read. [ADR 0016](0016-local-authentication-model.md) already decides that a session identifies a user, not a family, and that the client names the family it acts in on each request. The server accepts that family only when the user is a current member.

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
- **Single-use code with a short lifetime.** Works without mail, can be revoked, and limits the damage from a leak. Chosen.

## Decision

**Roles**

- A family has two roles: `admin` and `member`.
- The person who creates a family becomes its first admin.
- An admin may rename the family, issue and revoke invitations, remove a member, and change a member's role.
- A member may read the family's shared data, create family-shared entities, leave the family, and manage their own private data.
- Only an admin may remove another member or change roles. A member may not remove an admin.

**Invitations**

- An admin creates an invitation. It is a random code of at least 128 bits, shown once to the admin, and stored only as a hash.
- The invitation is single use. The first person who accepts it becomes a member with the `member` role. A second attempt is refused with the same message as an unknown code, so a code's state is not revealed.
- An invitation expires seven days after it is created. An admin may revoke an unused invitation at any time.
- The code is entered on the Join Family Space screen. A link that carries the same code may be added later; it is not part of this record.
- An invitation does not grant a role above `member`. Admin rights are given only by an admin changing a role after the person has joined.
- Joining requires a signed-in account. Invitations are refused for accounts that are disabled (see [ADR 0016](0016-local-authentication-model.md)).

**Several families**

- A person may belong to any number of families. Each membership is one row in the family module's membership table, with its own role.
- A session still identifies the user only. The client names the active family on each request, and the server checks current membership, as [ADR 0016](0016-local-authentication-model.md) already sets out.
- The personal access group is not a family. It exists for every user, cannot be shared, and is not counted as a membership.

**At least one admin**

- A family must always have at least one admin. The server refuses any change that would leave a family with no admin: removing the last admin, demoting the last admin, or the last admin leaving.
- The last admin must first promote another member, or the family is ended in a later record. This record does not define ending a family.

**Ownership and boundaries**

- The membership and invitation tables use the **family** scope of [ADR 0009](0009-table-ownership-scopes.md): each row has a non-null `family_id`, and row-level security limits access to that family's members.
- Invitation codes are stored in a table of their own in the family module. Their hashes are never sent to the client after creation.
- Identity keeps the read-only projection of current memberships described in [ADR 0016](0016-local-authentication-model.md). Membership changes are published as events under [ADR 0002](0002-outbox-events-and-projections.md).
- Membership, roles and invitations are never feature-gated. The family module never imports the entitlements or billing modules.

## Consequences

- Joining works on a server with no mail configured, and an invitation cannot be used by anyone who later sees it.
- The two-role model is easy to check and to test. Permission checks live in `packages/access-control`, so every module asks the same question.
- A household with no second admin cannot lose its only admin by accident: the server refuses the change.
- Per-permission roles, email invitations and invitation links are not built. Each needs its own record if it is wanted.
- Removed members keep access until the identity projection catches up, a few seconds on a local server, as [ADR 0016](0016-local-authentication-model.md) already accepts.
- Follow-up issues for members, invitations and access groups must reference this record.
- Owner acceptance is pending. Until the owner accepts this record, the status stays `Proposed`.
