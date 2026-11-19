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
- `calendar-event-guest-invited-v1` → `event-invited`, for the invited guest, with `data = { eventId }`
- `calendar-reminder-due-v1` → `event-reminder`, for the creator of the reminder, with `data = { eventId }`

Each subscriber writes the inbox item in its own transaction. The item's id is the id of the fact itself, so a redelivered fact leaves one item and two reminders of one event leave two items. The producer publishes the fact in the same transaction as the change, so a rolled-back change leaves no item. A producer never names a notice type. See [ADR 0026](../../docs/adr/0026-notifications-map-domain-facts.md).

`user-notified-v1` is retired. It stays in the contracts because it is a released event, and no module publishes it.

## Routes

- `GET /api/me/notifications`: the caller's items, newest first, one page at a time. Query: `limit` (1 to 50, default 20), `cursor`, an opaque value that the previous page returned as `nextCursor` (omit it for the first page), `category` (`calendar` or `account-security`) and `unread` (only the value `true`). `category` and `unread` combine. Each item has a `category` taken from `NOTIFICATION_CATEGORY_BY_TYPE` in `src/constants.ts`, which maps every notice type to one category; a new type needs one entry there and fails to compile without it. Response: `{ notifications: [{ id, type, category, data, createdAt, readAt }], unreadCount, nextCursor, total }`. `total` counts the items that match the filters, and the paging walks only those items. `unreadCount` is the caller's unread count across the whole inbox, not the filter and not the page, so the bell badge does not change when a filter is set. `nextCursor` is `null` on the last page. A `limit` outside 1 to 50, an unknown `category`, an `unread` value other than `true`, or a cursor the server did not issue, gets `400 VALIDATION_FAILED`. The cursor carries only a timestamp and an item id, and the error never echoes it. Filters are stored on the existing `type` and `read_at` columns, so no migration is needed.
- `POST /api/me/notifications/:notificationId/read`: marks one item read and returns `204`. Re-marking keeps the first read time. An item that is not the caller's gets `404 NOT_FOUND`.
- `POST /api/me/notifications/read-all`: marks every unread item of the caller read, whatever the category, and returns `200 { updated }`, where `updated` is the number of items that were unread (0 when none). Items already read keep their first read time, and another person's items are never touched. It takes no body. Without a signed-in person it gets `401 UNAUTHENTICATED`.

## Channels

A channel is a way to reach a person besides the inbox: `NotificationChannel` in `src/types.ts`, with `deliver(notice)`. The inbox is always written, in the subscriber's transaction. Channels run after that transaction commits, through `deliverToChannels`, which never throws. A channel that fails is logged by its name and error type only, and the other channels still run.

The realtime channel is always registered first, in front of any channels passed in the options (`createRealtimeChannel` in `src/infrastructure/realtime/`, name `REALTIME_CHANNEL_NAME`). Mobile push, web push ([ADR 0024](../../docs/adr/0024-browser-notifications-web-push.md)) and email each register one by passing it in the options. No caller changes.

A subscriber calls the channels only when its inbox insert actually added a row. A fact that is redelivered (same notification id, so `skipDuplicates` inserts nothing) calls no channel a second time. Any future channel inherits this, so mail and push do not repeat either.

## Realtime

The hub lives in `src/infrastructure/realtime/` and its worker in `src/workers/realtime/`. The hub holds the open realtime streams of each person. `createNotificationHub` lets code subscribe per user, publish a notice to that user's open subscribers in publish order, unsubscribe, and close all of them. Each subscriber has a bounded queue of 100 pending notices (`SUBSCRIBER_QUEUE_LIMIT`). A subscriber whose queue overflows, or whose send fails, is closed once and removed. The other subscribers keep receiving. A send failure is logged by its error type only. `publish` never throws and never waits for a stream to send.

The realtime channel publishes each new notice to the hub after the inbox transaction commits. The payload is the list item that `GET /api/me/notifications` returns (`id`, `type`, `category`, `data`, `createdAt`, `readAt: null`), and it goes only to the subscribers of the notice's user. A rolled-back change publishes nothing, and a failed publish is logged by name and error type while the inbox row stays.

The module creates one hub per process, shared by the realtime channel and the realtime worker, and closes it through that worker when the server stops. The hub is not exported from `src/index.ts`. Its open streams are in process memory only, which is per instance by nature. See [ADR 0035](../../docs/adr/0035-realtime-notifications-over-sse.md) and [ADR 0019](../../docs/adr/0019-state-shared-between-instances.md). A second instance would not see these streams, so multi-instance fan-out needs its own ADR.

## Layout

```
src/types.ts                       all types of the module
src/constants.ts                   module constants
src/application/inbox/             list, mark read, mark all read and write the inbox
src/application/channels/          deliver a notice to the registered channels
src/application/errors/            NotificationNotFoundError
src/infrastructure/inbox/          one file per table operation
src/infrastructure/realtime/       in-process hub of open streams per person
src/events/                        one subscriber per domain fact
src/http/                          the three routes
src/workers/realtime/              starts and stops the hub with the server
```

## Not built yet

- The HTTP stream route, a cap on open streams per person, a heartbeat and replay from `Last-Event-ID`. The stream route is added by OG-148.
- Fan-out across instances. This needs its own ADR.
- Delivery state per channel. A table with one row per notice and channel is added with the first channel, since the inbox row is the only delivery state today.
- Any web app screen for the inbox. None is shown for now.
