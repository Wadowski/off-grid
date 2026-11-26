# 0043. The API is served under `/api` on the web origin through the web container

- **Status:** Accepted

## Context

[ADR 0015](0015-no-reverse-proxy-cors-on-the-server.md) removed the reverse proxy and had the browser call the server on its own port, 3000, with CORS. A home server with other services on the same host cannot keep port 3000 free, and an address such as `http://host:3000` is awkward to type and share. The published web image also baked the API port into the build, so changing `OFFGRID_SERVER_PORT` never reached the browser.

The web container already serves the web app on one published port. Its nginx can forward requests on the same origin to the server container over the Compose network.

## Decision

The web app calls the API at `/api` on its own origin. `serverOrigin` returns the build argument `VITE_API_ORIGIN` when it is set, and an empty string otherwise.

The web container's nginx forwards `/api/` to `server:3000` on the Compose network. The forwarding turns off response and request buffering, so uploads stream through unchanged and Server-Sent Events arrive as they are sent. It sets the read and send timeouts to one hour and removes the body size limit, which the server enforces itself.

The `server` service no longer publishes a host port. The only published port is `OFFGRID_WEB_PORT`, and `OFFGRID_SERVER_PORT` is removed from the configuration.

`OFFGRID_CORS_ORIGINS` still limits cross-origin requests to the server. Requests from the web app are same-origin, so the default needs no change for a browser on the page's own address.

## Consequences

- A host reverse proxy, or the browser's address bar, only needs to reach the web port. The API is `http://<host>:<web port>/api`.
- Local access stays plain HTTP, as in ADR 0015.
- The server is reachable only through the web container, which narrows what the network can reach.
- The `web` service now depends on the server being reachable at runtime. nginx resolves `server` through Docker's DNS at request time, so the web container starts before the server is ready.
- The web image and the server image must come from the same release. Their API routes are the contract between them, as before.
- The privacy statement changes from "the web app and the API each listen on a port" to "only the web port is open".
