# 0015. No reverse proxy; the server allows its web origins with CORS

- **Status:** Accepted

## Context

The local stack put Caddy in front of the web app and the API. Caddy served `https://localhost` with an internal certificate authority, sent `/api/*` to the server and everything else to the web container, and redirected port 80 to 443. Browsers then saw one origin, so the server needed no cross-origin configuration.

The stack runs as one of many services on a home host. Caddy adds a service, a certificate authority volume and a second routing layer to explain and maintain. The web app will also run in the cloud, on an origin of its own, so the server must handle cross-origin requests in any case.

## Decision

We will remove Caddy from the stack. Compose publishes the `web` service on `OFFGRID_WEB_PORT` (default 8080) and the `server` service on `OFFGRID_SERVER_PORT` (default 3000), on all network interfaces.

The server allows browser requests only from the origins in `OFFGRID_CORS_ORIGINS`, a comma-separated list of absolute URLs. The default in compose is `http://localhost:8080`. The server allows no cross-origin request when the list is empty. It never answers with a wildcard origin.

The web app calls the API at `OFFGRID_API_ORIGIN` when that build argument is set. Otherwise it uses the page's own host with port 3000.

## Consequences

- Local access is plain HTTP. Traffic between devices on the local network is not encrypted. TLS for local access is out of scope until a later decision adds it, possibly at the host or in the cloud deployment.
- A device on the network can use the web app only after its page origin is added to `OFFGRID_CORS_ORIGINS`.
- The `server` port is reachable from the network, not only from the host. Access control and identity must protect every API route, because the network is no longer behind a proxy.
- The stack has one fewer service and no certificate volume. The migration and secrets setup are unchanged.
- The privacy promise in [privacy-guards.md](../privacy-guards.md) changes from "no open ports except the reverse proxy" to "no open ports except the web app and the API".
- The cloud deployment needs its own decision on TLS and routing. It is not covered by this record.
