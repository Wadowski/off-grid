# @offgrid/relations

Purpose: links between items across modules. Today a calendar event can be linked to another calendar event, and notes and files will add their own types ([ADR 0031](../../docs/adr/0031-cross-entity-links.md)).

Public API: `relationsModule` from `src/index.ts`. HTTP routes under `/api/links`:

- `POST /api/links` creates a link, or returns the existing one (200).
- `GET /api/links?entityType=calendar-event&entityId=<id>` lists the visible links of an event, with the other end's title.
- `DELETE /api/links/:id` removes a link the caller's context owns.

Owned tables (schema `relations`):

- `cross_entity_link`: links by id and ends, owned by a family or a user (`family-or-user`).
- `linkable_entity`: projection of calendar events, with the title and a removal tombstone (`family-or-user`, read-only for the module's routes).
- `linkable_entity_guest`: projection of guest invitations (`user`, the guest's id).
- `family_member`: projection of family membership (`family`).

Consumed events (subscribers run as `relations`, `onFailure: halt`):

- `calendar-event-created-v1`, `calendar-event-updated-v1`, `calendar-event-removed-v1`: maintain `linkable_entity`. A removal also deletes the event's guest rows and links.
- `calendar-event-guest-invited-v1`: records a guest row under the host's user context.
- `family-member-added-v1`, `family-member-removed-v1`: maintain `family_member`.

Privacy: event titles are copied into `relations.linkable_entity`. They are never logged. No outbound calls.

Imports: none from other modules. Other modules read links only through the HTTP API.

Owner: module team (relations)
