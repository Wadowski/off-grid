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
