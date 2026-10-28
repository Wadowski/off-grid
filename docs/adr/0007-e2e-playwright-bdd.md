# 0007. End-to-end tests with Playwright-BDD

- **Status:** Accepted

## Context

Features are specified before they are built (see the workflow in [CLAUDE.md](../../CLAUDE.md)). The same specification should drive the end-to-end tests, so the behavior written down is the behavior checked.

## Decision

- End-to-end scenarios are written as Gherkin `.feature` files under `e2e/features/`.
- The scenarios run with Playwright-BDD, which binds each step to Playwright code in `e2e/`.
- New scenarios start tagged `@wip` and lose the tag when the feature is finished.

## Consequences

- Product owners and agents can read and review the scenarios as plain language.
- Step definitions are shared code and need the same review as application code.
- A finished feature with a `@wip` tag still in the repository is a defect under the Definition of Done.
