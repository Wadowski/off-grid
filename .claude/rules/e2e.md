---
paths:
  - "e2e/**"
  - "**/*.feature"
---

# End-to-end and Gherkin rules

Scenarios are written first and drive the Playwright-BDD tests ([ADR 0007](../../docs/adr/0007-e2e-playwright-bdd.md)).

- DO write one behaviour per scenario, in declarative business language.
- DO tag new scenarios `@wip`, and remove the tag when the feature works.
- DO use the tags `@smoke`, `@a11y` and `@module:<name>` where they apply.
- DO set up state through the public API factories in Given steps.
- DO keep each scenario isolated, with a fresh family.
- DON'T put selectors, URLs or HTTP details in `.feature` files. Put them in step definitions under `e2e/steps/`.
- DON'T use test-only backdoors to set up state.
- DON'T leave `@wip` on finished work. It is a Definition of Done failure ([CLAUDE.md](../../CLAUDE.md)).
