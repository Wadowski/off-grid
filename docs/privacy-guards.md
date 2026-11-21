# Privacy guards

Offgrid promises no telemetry, no data sent to third parties, and no open ports except the web app and the API. The guards in this document check that promise on every pull request, so it does not rest on trust alone.

## Telemetry denylist: `pnpm check:no-telemetry`

`scripts/check-no-telemetry.mjs` fails when the repository contains an analytics, tracking or error-reporting SDK, or calls a known telemetry host. It checks three things:

1. **Resolved dependencies.** Every package in `pnpm-lock.yaml` is compared with the denylist.
2. **Imports.** Every import in the source directories (`apps`, `modules`, `packages`, `e2e`, `scripts`, `infra`) is compared with the denylist.
3. **Hosts.** Every `http(s)://` URL in those source files is compared with the denylist. A host also matches its subdomains.

The denylist is `scripts/telemetry-denylist.json`. A package entry ending in `/*` matches a whole scope, for example `@sentry/*`.

The check reads its own files and skips them when it scans source, because the denylist and its tests must name the packages they block. Markdown is not scanned.

### Adding an exception

Add an entry with a reason to the `exceptions` list in `scripts/telemetry-denylist.json`:

```json
{
  "name": "posthog-js",
  "reason": "Why this is needed, and why it does not send data off the device."
}
```

The name is the package name or the host. The check refuses an exception with an empty reason. The reason is part of the review: say what the code sends, where, and whether it can be turned off in local mode. A pull request that adds an exception needs a privacy review.

## Egress-blocked stack: `pnpm check:stack-egress`

`scripts/check-stack-egress.mjs` starts the compose stack with `infra/compose/docker-compose.egress-blocked.yml` on its own project name. The override puts every service on an `internal: true` network and publishes no ports, so the stack cannot reach the internet and does not collide with a running stack. The check asserts two things from inside the `server` container:

1. `/api/health/ready` answers.
2. An outbound request to `http://1.1.1.1/` fails with `ENETUNREACH` or `EHOSTUNREACH`. Any other failure, or a reachable address, fails the check and says which one it was.

This is the one outbound request in the repository. The probe sends a plain GET with no body, headers or app data, runs only in CI, and only inside the egress-blocked stack. It is a test of the network, not a feature.

It always tears the stack down, and it needs Docker and Docker Compose 2.24.4 or newer, which the `!reset` tag in the override requires.

The `stack-guard` CI job runs this check on changes to `infra/`, `apps/`, `modules/`, `packages/`, `pnpm-lock.yaml` and `Dockerfile*`. On other changes it reports success without starting the stack. On a nightly or manual run, where there is no base commit to diff, it always runs.

## Production Compose guards: `pnpm check:compose`

`pnpm check:compose` runs two checks on the production Compose file, `infra/compose/docker-compose.production.yml`:

1. `scripts/check-compose-no-published-ports.mjs` fails when the `updater` service publishes a port, when `updater` does not mount the Docker socket, or when any other service mounts the socket. The socket is the only way to reach the host's Docker daemon, which is root on the host, so only the updater may hold it.
2. `scripts/generate-compose-production-configs.mjs --check` fails when the `configs` block of the production file differs from the output generated from `infra/init/sql/*` and `infra/compose/secrets-init.sh`. The generator is `pnpm compose:production:generate`.

The `check:compose` script is a `pnpm` script. Run it locally before a pull request that changes the Compose files, the init SQL or the secrets script.

## Update hosts: the outbound allow-list

ADR 0032 lists the only hosts that an update may contact. For the release lookup and the manifest download, the updater refuses every other host, and it follows only the one redirect to `release-assets.githubusercontent.com`. Image pulls go to `ghcr.io` and to the host that it redirects to:

- `api.github.com`: the GitHub Releases API, for the release list and the manifest lookup.
- `release-assets.githubusercontent.com`: the redirect target of the manifest download.
- `ghcr.io`: the image manifests.
- `pkg-containers.githubusercontent.com`: the redirect target of the image downloads.

The updater makes these calls only for an admin's action (Check for updates, Update system) or for the opt-in nightly run. The install script and `set-latest-version.sh` call `github.com` (whose release downloads redirect to `release-assets.githubusercontent.com`), `api.github.com`, `ghcr.io`, `download.docker.com` and the distribution's package mirrors, only when the owner runs them. The privacy statement, [privacy.md](privacy.md), lists the same hosts. A change to this list needs an update of ADR 0032, the privacy statement and the updater's allow-list in the same pull request.

The end-to-end suite replaces these hosts with the fake release source described below. The production Compose file sets none of the override variables, so the allow-list above applies unchanged on a host.

## Fake release source in the e2e suite

The e2e update and install scenarios never contact GitHub or `ghcr.io`. `e2e/support` starts a fake release source on the test host over https with a per-run certificate authority, and the e2e Compose override points the updater (`OFFGRID_UPDATER_RELEASE_API_BASE_URL`, `OFFGRID_UPDATER_IMAGE_REGISTRY`) and the install script (`OFFGRID_RELEASE_DOWNLOAD_BASE_URL`) at it and at a local registry. The fake source logs every request, and the steps assert that the logged hosts are only the fake one. See [ADR 0032](adr/0032-outbound-update-check-and-image-pull.md), amendment OG-175.
