# 0031. Cross-entity links: owner-scoped links, projected titles, guests read through a projection

- **Status:** Accepted

## Context

Notes and files must be able to link to calendar events (OG-91). A link must show the event's current title. It must never reveal an event, or its title, to someone who cannot see that event. The relations module owns links, and it may read other modules' data only through events and read-only projections ([ADR 0002](0002-outbox-events-and-projections.md)).

Calendar events are visible to their owner, to members of their family, and to guests while the guest still shares a family with the host ([ADR 0029](0029-event-guest-access.md)). The event bus delivered `familyId` to subscribers but not the owning `userId`, so a private event could not be projected with its owner.

## Decision

- We will create `relations.linkable_entity`, a projection of calendar events: `entity_type`, `entity_id`, one owner (`family_id` or `user_id`), `title`, `source_version` and `is_removed`. It is written only by the relations subscribers. A removed event keeps a tombstone at its removal version, so a late create or update cannot bring it back.
- We will create `relations.cross_entity_link`, owned by the acting context: a family-owned link when the request names an active family, otherwise a user-owned link. It stores ids and the creator only. Titles are not copied to the link; they are read from the projection at list time, and only for ends that the caller can see and that are not removed.
- We will create `relations.linkable_entity_guest` (user-scoped, one row per guest and event) and `relations.family_member`, a projection of family membership with the same source-version rule as the calendar projection. A guest reads a linkable event while a guest row names them and a `SECURITY DEFINER` check, `relations.shares_family_with_caller`, confirms they still share a family with the host. The function is needed because a row-level policy cannot see the host's membership rows.
- We will deliver the owning user id to subscribers as `EventOf<D>.userId`, attached by the event bus from the outbox row. The published event envelope and `released-events.json` do not change, and no new event version is needed.
- We will hide, rather than delete, links whose other end is removed. A list skips a link whose other end has no visible, non-removed projection row. The removal handler deletes the guest rows of the event and every link that the event's owner can see, in the same transaction as the tombstone.
- We will return `200` with the existing link when the same ordered pair is linked again, `409` when the pair exists but the caller cannot see it, `422` for a link from an event to itself, and `404` for an endpoint that does not exist or is not visible.
- We will keep the projection subscribers `onFailure: "halt"`, as the calendar module does for its projections. A change that arrives before an earlier change stops the subscriber until it is replayed.

## Consequences

- Easier: the database enforces who can see a link, and a link never carries a title. A rename updates every link's displayed title with no write to any link row.
- Harder: `SECURITY DEFINER` function `relations.shares_family_with_caller` is a documented exception to the owner policy and must be reviewed with membership rules. Links owned by another person to an event that is later removed remain as hidden rows until their owner deletes them, because the removal runs in the event owner's context.
- Known gap: a guest-uninvite event does not exist in the calendar, so relations never removes a guest row for an uninvite. Access ends through family removal or event removal.
- Known gap: the guest rule uses family sharing only. A guest who is removed from the family loses link visibility, which matches ADR 0029.
- Follow-up: notes and files add their own linkable types and projections, each with its own event and ADR.
