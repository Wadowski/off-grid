# Privacy guards

Offgrid promises no telemetry, no data sent to third parties, and no open ports except the reverse proxy. The guards in this document check that promise on every pull request, so it does not rest on trust alone.

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

## Planned checks

These checks are part of OG-39 and are not in place yet.

- **Egress-blocked stack** (`pnpm check:stack-egress`): starts the compose stack with `infra/compose/docker-compose.egress-blocked.yml`, which puts `server`, `db` and `web` on an `internal: true` network, and asserts that the stack still reaches `/api/health/ready`.
- **Published ports** (`pnpm check:stack-ports`): asserts that only the `caddy` service publishes host ports.

Both run in a `stack-guard` CI job on changes to `infra/**`, `apps/**` and `Dockerfile*`.
