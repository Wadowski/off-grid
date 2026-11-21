# e2e

End-to-end behaviour is specified in Gherkin and run with Playwright-BDD ([ADR 0007](../docs/adr/0007-e2e-playwright-bdd.md)).

```
features/<module>/*.feature   scenarios in business language
steps/*.steps.ts              step definitions, grouped by domain
support/                      fixtures shared by the steps (the scenario `world`)
```

## Grouping

- Feature files go in `features/<module>/`, one folder per module. Cross-cutting checks that belong to no product module go in `features/system/`, for example `health.feature`.
- Step definitions go in `steps/`, grouped by domain. A steps file covers one domain and can serve several features, so there is no one-to-one match between a feature file and a steps file.
- Shared code goes in `support/`: the scenario `world` fixture, and later the API factories and page objects. Steps import from `support/`; `support/` never imports from `steps/`.

## Running

Run from the repo root. Each run brings up its own compose stack and tears it down afterwards, including volumes:

- `pnpm e2e` runs every scenario except `@wip`, against a fresh stack.
- `pnpm e2e:smoke` runs the `@smoke` scenarios.
- `pnpm e2e:wip` runs scenarios still being built.
- `pnpm lint:features` checks the feature files with gherkin-lint.
- `pnpm --filter @offgrid/e2e test` runs the unit tests of the harness and factories.

The stack is `infra/compose/docker-compose.yml`, limited to the `db`, `init` and `server` services. Each run uses a unique compose project name, so runs do not share containers or data.

### Environment

- `E2E_SERVER_PORT` is the host port the stack publishes the server on (default `3000`). Set it when another stack already uses 3000, for example `E2E_SERVER_PORT=3100 pnpm e2e`.
- `OFFGRID_FILES_MAX_UPLOAD_BYTES` sets the upload limit of the e2e server (default `1048576`, 1 MiB, set in `infra/compose/docker-compose.e2e.yml`). Set it to choose another limit for the upload scenarios.
- `BASE_URL` overrides the URL the tests target (default `http://127.0.0.1:<E2E_SERVER_PORT>`).
- The e2e stack builds the server from the same `runtime` image as production. It has no test-only routes or switches.
- `E2E_RELEASE_SOURCE_PORT` (default `18443`) and `E2E_REGISTRY_PORT` (default `5000`) are the host ports of the fake release source and the local image registry.
- `E2E_REUSE_STACK=1` skips bring-up and teardown and tests a stack that is already running on the target URL. Use it for a fast local loop, for example `E2E_REUSE_STACK=1 pnpm e2e:smoke`.

To keep a stack running while you iterate, start and stop it by hand:

```bash
pnpm e2e:stack:up
E2E_REUSE_STACK=1 pnpm e2e:smoke
pnpm e2e:stack:down
```

Manual commands use the project name `offgrid-e2e-local` and the `E2E_SERVER_PORT` port.

## Update and install scenarios

`features/system/system-update.feature` and `features/system/install.feature` run in the `system-update` Playwright project, after the main project in the configuration order, one scenario at a time, because they replace the running server and web containers.

The stack includes the `updater` service and a local `registry:2`. `support/release-source/` holds the fake release source: an https server (per-run certificate from `scripts/e2e-release-certificate.mjs`, trusted only by the updater and the install script through the e2e Compose override) that serves GitHub-shaped release data for versions `1.0.0` (the running stack), `1.1.0`, `1.2.0`, `1.3.0` and `1.9.0`, whose server image answers its health check with an error. Release images are derived from the stack images, pushed to the local registry and pinned by digest in each manifest. The fake source logs every request to `artifacts/release-source/requests.log`; it is the only release host the updater and the install script contact. See [ADR 0032](../docs/adr/0032-outbound-update-check-and-image-pull.md), amendment OG-175.

`pnpm e2e -- --project=system-update` runs only these scenarios. The project has no Playwright dependency on the main project, because command-line filters do not narrow a dependency and `e2e:changed` would run the whole main suite first; the single worker keeps the order.

## Debugging a failure

A failed run writes its artifacts under `e2e/artifacts/` (gitignored):

- `artifacts/test-results/<scenario>/trace.zip`: the Playwright trace. Open it with `pnpm exec playwright show-trace <path>`.
- `artifacts/test-results/<scenario>/`: screenshots, videos and the error context of the failing scenario.
- `artifacts/service-logs.txt`: the server and database logs of the stack, with timestamps, written when the first scenario fails.
- `artifacts/report/`: the HTML report, when `CI` is set.

## Screenshots of changed screens

Tag a scenario `@ui` when it shows a screen. With `E2E_SCREENSHOTS=1`, the last state of every `@ui` scenario is saved as a full-page PNG at `artifacts/screens/<feature>/<scenario>.png`, and a step can save more states with `captureScreen(page, "name")` from `support/screenshots.ts`. `E2E_SCREENSHOTS_DIR` overrides the folder. Without the variable nothing is captured, so normal runs are unchanged.

The `ui-screenshot-reviewer` agent (`.claude/agents/`) runs this for the screens a branch changed and reviews the images. Run it for any issue that changes `apps/main-web/` or `packages/ui/`.

## Conventions

- One behaviour per scenario, in declarative business language.
- New scenarios start tagged `@wip`; remove the tag once the feature works.
- Allowed tags: `@smoke`, `@a11y`, `@wip`, `@infra`, `@ui`, `@module:<name>`.
- No selectors, URLs or HTTP details in `.feature` files. Put them in `steps/`.
- Given steps set up state through the public API factories, not test-only backdoors.
- Each scenario is isolated and creates its own data.
