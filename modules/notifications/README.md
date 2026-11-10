# @offgrid/notifications

Purpose: the one place that owns every notice to a person. It stores the inbox and delivers each notice through the channels that are registered. See [ADR 0025](../../docs/adr/0025-one-module-owns-notifications.md).

Public API: only `createNotificationsModule` from `src/index.ts`. Other code imports nothing else from this package.

Owner: module team (notifications)

## Data

- `notifications.notification` (scope `user`): the inbox. One row per notice: its type, its `data` (a JSON object of strings), the created time and the read time. Added by migration `20261113000000_notifications_inbox`, which copies the rows of the former `identity.notification` table and drops it.

## Events

The module consumes domain facts and maps each one to a notice. The mapping is one constant, `FACT_NOTICES` in `src/constants.ts`:

- `password-changed-v1` → `password-changed`
- `recovery-code-regenerated-v1` → `recovery-code-regenerated`

Each subscriber writes the inbox item in its own transaction. The item's id is the event id, so a redelivered event leaves one item. The producer publishes the fact in the same transaction as the change, so a rolled-back change leaves no item. A producer never names a notice type. See [ADR 0026](../../docs/adr/0026-notifications-map-domain-facts.md).

`user-notified-v1` is retired. It stays in the contracts because it is a released event, and no module publishes it.

## Routes

- `GET /api/me/notifications`: the caller's items, newest first, as `{ notifications: [{ id, type, data, createdAt, readAt }], unreadCount }`.
- `POST /api/me/notifications/:notificationId/read`: marks one item read and returns `204`. Re-marking keeps the first read time. An item that is not the caller's gets `404 NOT_FOUND`.

## Channels

A channel is a way to reach a person besides the inbox: `NotificationChannel` in `src/types.ts`, with `deliver(notice)`. The inbox is always written, in the subscriber's transaction. Channels run after that transaction commits, through `deliverToChannels`, which never throws. A channel that fails is logged by its name and error type only, and the other channels still run.

The module registers no channel yet, so `createNotificationsModule()` has an empty channel list. Mobile push, web push ([ADR 0024](../../docs/adr/0024-browser-notifications-web-push.md)) and email each register one by passing it in the options. No caller changes.

## Layout

```
src/types.ts                       all types of the module
src/constants.ts                   module constants
src/application/inbox/             list, mark read and write the inbox
src/application/channels/          deliver a notice to the registered channels
src/application/errors/            NotificationNotFoundError
src/infrastructure/inbox/          one file per table operation
src/events/                        one subscriber per domain fact
src/http/                          the two routes
```

## Not built yet

- Delivery state per channel. A table with one row per notice and channel is added with the first channel, since the inbox row is the only delivery state today.
- Any web app screen for the inbox. None is shown for now.
