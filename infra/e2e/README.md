# E2E in one container

`infra/e2e/smoke.Dockerfile` builds one image that runs the whole stack and the
Playwright suite in a single container: PostgreSQL 17, migrations, the server, the web
build behind nginx, a mail catcher and Playwright. See `smoke-entrypoint.sh` for the
start order.

## Run

```bash
pnpm e2e:smoke:container   # @smoke scenarios only
pnpm e2e:container         # every chromium scenario, @wip excluded
```

Extra arguments go to Playwright, for example:

```bash
pnpm e2e:container --grep "Create a family"
```

Artifacts (test results, screenshots, service logs) are written to `e2e/artifacts/`.

## Not in the container

The `system-update` project (`install.feature` and `system-update.feature`) drives
nested Docker: it builds release images and runs install hosts through the Docker
socket. It stays on the host, with `pnpm e2e` and its Docker stack.

## Notes

- Postgres uses trust authentication. That is acceptable only because the database
  lives and dies inside this throwaway container.
- The `mail` hostname the forgot-password steps use is mapped to loopback in the
  entrypoint.
