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
- `BASE_URL` overrides the URL the tests target (default `http://127.0.0.1:<E2E_SERVER_PORT>`).
- `E2E_REUSE_STACK=1` skips bring-up and teardown and tests a stack that is already running on the target URL. Use it for a fast local loop, for example `E2E_REUSE_STACK=1 pnpm e2e:smoke`.

To keep a stack running while you iterate, start and stop it by hand:

```bash
pnpm e2e:stack:up
E2E_REUSE_STACK=1 pnpm e2e:smoke
pnpm e2e:stack:down
```

Manual commands use the project name `offgrid-e2e-local` and the `E2E_SERVER_PORT` port.

## Debugging a failure

A failed run writes its artifacts under `e2e/artifacts/` (gitignored):

- `artifacts/test-results/<scenario>/trace.zip`: the Playwright trace. Open it with `pnpm exec playwright show-trace <path>`.
- `artifacts/test-results/<scenario>/`: screenshots, videos and the error context of the failing scenario.
- `artifacts/service-logs.txt`: the server and database logs of the stack, with timestamps, written when the first scenario fails.
- `artifacts/report/`: the HTML report, when `CI` is set.

## Conventions

- One behaviour per scenario, in declarative business language.
- New scenarios start tagged `@wip`; remove the tag once the feature works.
- Allowed tags: `@smoke`, `@a11y`, `@wip`, `@infra`, `@module:<name>`.
- No selectors, URLs or HTTP details in `.feature` files. Put them in `steps/`.
- Given steps set up state through the public API factories, not test-only backdoors.
- Each scenario is isolated and creates its own data.
