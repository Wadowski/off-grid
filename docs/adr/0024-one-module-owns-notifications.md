# 0024. One module owns every notification

- **Status:** Accepted

## Context

Notices to a person were split across identity. Identity wrote the inbox row, ran the email channel, and exposed the inbox routes. Each new kind of notice or channel would have to be added to identity, which is the wrong owner for inbox and delivery logic.

[ADR 0002](0002-outbox-events-and-projections.md) and [ADR 0006](0006-modular-monolith.md) say modules talk only through versioned events, and one module owns each piece of data. A notice raised in a change must still be rolled back with that change.

[OG-89](https://linear.app/offgridos/issue/OG-89/generic-notification-core-with-pluggable-channels) asks for a core that accepts a notice and delivers it through pluggable channels. Mobile and web push are planned.

## Decision

- We will make `modules/notifications` the only owner of notices. It owns the inbox table, the inbox routes, and the channel registry.
- Other modules publish `user-notified-v1` in the same transaction as the change that caused the notice. They never write the inbox. The notifications module consumes the event and writes the inbox item in its own transaction.
- The inbox is written for every notice. Channels run after commit and cannot undo the inbox write.
- A channel is a `NotificationChannel`, and it is registered when the module is created. Adding one needs no change to any publishing module.
- The former `identity.notification` table moves to `notifications.notification`. The migration copies its rows and drops the old table.
- The email notice for a password change or a new recovery code is removed. Identity's emailed recovery code is a separate flow and stays ([ADR 0018](0018-outgoing-mail-to-a-chosen-provider.md)).
- No notification UI is built for now. The web app header keeps its disabled bell.

## Consequences

- Easier: one place to find and change how a person is notified, and one place to add a channel.
- Harder: an inbox item appears after the outbox poll, not in the same request. The e2e steps poll for it, and a person who acts and reloads at once may see it a moment later.
- Harder: a notice from a retried event can be delivered again to channels. Channels must be idempotent, as the event rules already require.
- Follow-up: the per-channel delivery table, added with the first external channel. Web push is still [ADR 0023](0023-browser-notifications-web-push.md) and is not implemented.
