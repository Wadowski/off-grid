# infra

Deployment assets: `compose/` (Docker Compose), `init/` (first-run setup).
Not a pnpm workspace.

The `updater` service (`apps/updater`) runs in the base Compose file. It has no published port, joins the default network so that `server` and `web` can be reached for health probes, and mounts `/var/run/docker.sock` (or `OFFGRID_DOCKER_SOCKET_PATH`) as the only service with the socket. Set `OFFGRID_DOCKER_GID` to the group id of that socket so the non-root updater can use it (default `0`), and `OFFGRID_RELEASE_REPOSITORY` to the `owner/name` of the GitHub repository that publishes releases (no default: the updater refuses to start until it is set). `scripts/check-compose-no-published-ports.mjs` (`pnpm check:compose`) fails when the updater publishes a port or another service mounts the socket.
