# 0033. Realtime notifications over server-sent events

- **Status:** Proposed

## Context

Notices are written to the notifications inbox after the outbox poll publishes the domain fact ([ADR 0025](0025-one-module-owns-notifications.md), [ADR 0026](0026-notifications-map-domain-facts.md)). A person with the web app open sees a new notice only when the app asks for the list again. Without a push channel, the app would poll the inbox list on a timer, which costs a request per open browser even when nothing changed.

The channel has to fit the constraints the project already sets:

- Traffic flows one way, from the server to the browser. The browser never sends data over the channel; it sends commands over normal requests.
- No new runtime dependency, and no outbound call from the server ([CLAUDE.md](../../CLAUDE.md) non-negotiables).
- Requests carry `Authorization: Bearer <token>` ([ADR 0016](0016-local-authentication-model.md)). The browser's `EventSource` API cannot set request headers.
- The main server runs as one process ([ADR 0019](0019-state-shared-between-instances.md)). Shared state that must agree across instances lives in Postgres. The browser reaches the server directly, with CORS allow-listing ([ADR 0015](0015-no-reverse-proxy-cors-on-the-server.md)); `Authorization` and `Last-Event-ID` are non-simple headers, so the stream route needs the same allow-listing.
- A client that reconnects must not lose notices written while it was away.

[ADR 0024](0024-browser-notifications-web-push.md) covers notices shown when the app is closed. This ADR covers only the open-app case and does not replace web push.

## Decision

- We will send realtime notices with server-sent events, not WebSocket. The stream is a plain `text/event-stream` response from a Fastify route. WebSocket would add a protocol upgrade and a library for two-way traffic that nothing needs.
- We will authenticate the stream with the bearer header. The browser client will call `fetch` with a streamed body, send the bearer token in the `Authorization` header, and read the SSE frames itself. We will not use `EventSource` with the token in the URL, because URLs end up in logs and browser history. We will not use cookie auth, which the app does not use.
- We will fan out in process. A hub in the notifications module keeps the open streams for each person and writes a notice to that person's streams after the inbox row commits. The hub holds no state that another instance must read.
- We will use the notice id as the SSE `id:` field. The notice id is the inbox row id, which is the event id ([ADR 0026](0026-notifications-map-domain-facts.md)). Inbox ids are random UUIDs, not ordered values, so the cursor never compares ids.
- The replay cursor must follow commit order, not `created_at`. The inbox `created_at` is the domain event's `occurredAt`, so a notice committed late can carry an earlier time than the cursor notice, and ordering by it would skip that notice on reconnect. A plain database sequence is not enough either, because its value is assigned before the transaction commits. The inbox therefore gets a commit-order column in a migration, and the replay reads with an overlap window that the client de-duplicates by notice id. The migration is a dependency of [OG-148](https://linear.app/offgridos/issue/OG-148).
- On reconnect the client sends `Last-Event-ID`. The server validates it as a UUID with zod, finds that notice for the same person, and replays the person's notices after it in commit order, then switches to live delivery.
- We will keep the stream from being buffered by any proxy in front of the server. The response sends `Cache-Control: no-cache` and `X-Accel-Buffering: no`, flushes the headers at once, and writes a heartbeat comment line on a fixed interval so idle connections stay open. Any proxy between the browser and the server must pass the stream through without buffering.
- The stream is scoped to the caller only. The route is `GET /api/me/notifications/stream` ([OG-148](https://linear.app/offgridos/issue/OG-148)). The event payload is the same notice the inbox list returns, with no more personal data than that list. Logs never record the notice text, the `data` payload or the `Last-Event-ID` header.
- The server checks the session on each heartbeat, so a revoked session ends its stream within one heartbeat interval. It also closes the stream when the bearer token expires. The client reconnects with a fresh token and the last seen `Last-Event-ID`.
- The stream route is rate-limited, and each person has a cap on open streams, so one client cannot exhaust connections.
- The stream makes no outbound call, adds no dependency and stores no secret.

## Consequences

- Easier: the server needs no new library. The protocol is plain HTTP, and reconnect with `Last-Event-ID` restores missed notices without extra state on the server.
- Easier: notices reach an open app without polling, and an idle app sends no requests.
- Harder: the client needs a small SSE reader on top of `fetch`, because `EventSource` cannot send the bearer header.
- Harder: each open stream holds a connection and a small amount of memory on the server.
- Harder: an operator must configure any reverse proxy to pass the stream through unbuffered. The server cannot enforce this from its side.
- Harder: the inbox needs a commit-order column and a replay that de-duplicates on the client. This is a migration in the notifications schema, which OG-148 depends on.
- Limit, single process: the hub lives in one process. A second server instance would not see notices written on the first, and a client connected to the second would miss live notices. Running more than one instance requires a shared bus, for example Postgres `LISTEN`/`NOTIFY`, which fits [ADR 0019](0019-state-shared-between-instances.md). That bus is not built by this decision and needs its own ADR before a second instance is supported.
- Relation to ADR 0019: the open connections are per instance by nature and are allowed in memory. The notice itself is in Postgres, so replay with `Last-Event-ID` works on any instance that reads the inbox.
- Follow-up: the hub ([OG-146](https://linear.app/offgridos/issue/OG-146)), the stream route ([OG-148](https://linear.app/offgridos/issue/OG-148)) and the web client issues that consume the stream. This ADR moves to `Accepted` when OG-148 lands.
