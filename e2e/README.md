# e2e

End-to-end behaviour is specified in Gherkin and run with Playwright-BDD ([ADR 0007](../docs/adr/0007-e2e-playwright-bdd.md)).

```
features/<module>/*.feature   scenarios in business language
steps/*.steps.ts              step definitions, grouped by domain
support/                      fixtures shared by the steps (the scenario `world`)
```

## Running

Start the server first, then run from the repo root:

- `pnpm e2e` runs every scenario except `@wip`.
- `pnpm e2e:smoke` runs the `@smoke` scenarios.
- `pnpm e2e:wip` runs scenarios still being built.
- `pnpm lint:features` checks the feature files with gherkin-lint.

`BASE_URL` sets the server address (default `http://127.0.0.1:3000`).

## Conventions

- One behaviour per scenario, in declarative business language.
- New scenarios start tagged `@wip`; remove the tag once the feature works.
- Allowed tags: `@smoke`, `@a11y`, `@wip`, `@infra`, `@module:<name>`.
- No selectors, URLs or HTTP details in `.feature` files. Put them in `steps/`.
- Given steps set up state through the public API factories, not test-only backdoors.
- Each scenario is isolated and creates its own data.
