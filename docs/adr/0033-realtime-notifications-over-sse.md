# 0033. Realtime notifications over server-sent events

- **Status:** Proposed

## Context

Notices are written to the notifications inbox after the outbox poll publishes the domain fact ([ADR 0025](0025-one-module-owns-notifications.md), [ADR 0026](0026-notifications-map-domain-facts.md)). A person with the web app open sees a new notice only when the app asks for the list again. Without a push channel, the app would poll the inbox list on a timer, which costs a request per open browser even when nothing changed.

The channel has to fit the constraints the project already sets:

- Traffic flows one way, from the server to the browser. The browser never sends data over the channel; it sends commands over normal requests.
- No new runtime dependency, and no outbound call from the server ([CLAUDE.md](../../CLAUDE.md) non-negotiables).
- Requests carry `Authorization: Bearer <token>` ([ADR 0016](0016-local-authentication-model.md)). The browser's `EventSource` API cannot set request headers.
- The main server runs as one process ([ADR 0015](0015-no-reverse-proxy-cors-on-the-server.md) describes how the browser reaches it). Shared state that must agree across instances lives in Postgres ([ADR 0019](0019-state-shared-between-instances.md)).
- A client that reconnects must not lose notices written while it was away.

[ADR 0024](0024-browser-notifications-web-push.md) covers notices shown when the app is closed. This ADR covers only the open-app case and does not replace web push.

## Decision

- We will send realtime notices with server-sent events, not WebSocket. The stream is a plain `text/event-stream` response from a Fastify route. WebSocket would add a protocol upgrade and a library for two-way traffic that nothing needs.
- We will authenticate the stream with the bearer header. The browser client will call `fetch` with a streamed body, send the bearer token in the `Authorization` header, and read the SSE frames itself. We will not use `EventSource` with the token in the URL, because URLs end up in logs and browser history. We will not use cookie auth, which the app does not use.
- We will fan out in process. A hub in the notifications module keeps the open streams for each person and writes a notice to that person's streams after the inbox row commits. The hub holds no state that another instance must read.
- We will use the notice id as the SSE `id:` field. The notice id is the inbox row id, which is the event id ([ADR 0026](0026-notifications-map-domain-facts.md)). Inbox ids are random UUIDs, not ordered values, so the replay rule does not compare ids. On reconnect the client sends `Last-Event-ID`. The server finds that notice for the same person, reads its `created_at` and `notification_id`, and replays the person's notices that sort after that pair in `(created_at, notification_id)` order, then switches to live delivery. - We will keep the stream from being buffered by any proxy in front of the server. The response sends `Cache-Control: no-cache` and `X-Accel-Buffering: no`, flushes the headers at once, and writes a heartbeat comment line on a fixed interval so idle connections stay open. Any proxy between the browser and the server must pass the stream through without buffering.
- The stream is scoped to the caller only. The route is `GET /api/me/notifications/stream` ([OG-148](https://linear.app/offgridos/issue/OG-148)). The event payload is the same notice the inbox list returns, with no more personal data than that list. Logs never record the notice text.
- The server closes the stream when the bearer token expires or is revoked. The client reconnects with a fresh token and the last seen `Last-Event-ID`.
- The stream makes no outbound call, adds no dependency and stores no secret.

## Consequences

- Easier: the server needs no new library. The protocol is plain HTTP, and reconnect with `Last-Event-ID` restores missed notices without extra state on the server.
- Easier: notices reach an open app without polling, and an idle app sends no requests.
- Harder: the client needs a small SSE reader on top of `fetch`, because `EventSource` cannot send the bearer header.
- Harder: each open stream holds a connection and a small amount of memory on the server.
- Harder: an operator must configure any reverse proxy to pass the stream through unbuffered. The server cannot enforce this from its side.
- Limit, single process: the hub lives in one process. A second server instance would not see notices written on the first, and a client connected to the second would miss live notices. Running more than one instance requires a shared bus, for example Postgres `LISTEN`/`NOTIFY`, which fits [ADR 0019](0019-state-shared-between-instances.md). That bus is not built by this decision and needs its own ADR before a second instance is supported.
- Relation to ADR 0019: the open connections are per instance by nature and are allowed in memory. The notice itself is in Postgres, so replay with `Last-Event-ID` works on any instance that reads the inbox.
- Follow-up: the hub ([OG-146](https://linear.app/offgridos/issue/OG-146)), the stream route ([OG-148](https://linear.app/offgridos/issue/OG-148)) and the web client issues that consume the stream. This ADR moves to `Accepted` when OG-148 lands.
