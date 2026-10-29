---
name: write-feature
description: Author a Gherkin .feature file for a Linear issue's acceptance scenarios, following the e2e rules. Use before implementing any user-visible behaviour, when the user asks for a feature file, or when a Linear issue lists scenarios or acceptance criteria that need covering.
---

# write-feature

Scenarios come first (CLAUDE.md workflow step 1). A feature file describes one business capability in plain language and is tagged `@wip` until the behaviour works.

Read first: [.claude/rules/e2e.md](../../rules/e2e.md) and [ADR 0007](../../../docs/adr/0007-e2e-playwright-bdd.md).

## Steps

1. **Collect the scenarios.** From the Linear issue, take its scenarios or acceptance criteria. Each one becomes one `Scenario`. If a criterion is ambiguous, ask before writing it down.
   Verify: list the scenario names in chat; the list matches the issue's acceptance criteria one to one.

2. **Pick the folder.** Put the file in `e2e/features/<module>/` where `<module>` is the owning module (for example `family`). Use a kebab-case file name that describes the capability, such as `e2e/features/family/invite-member.feature`. Create the folder if it is missing; `e2e/features/.gitkeep` marks the tree and can stay.
   Verify: `ls e2e/features` shows the module folder.

3. **Write the file.** Start with the template below. One behaviour per scenario, in business language. Give every new scenario the `@wip` tag. Add `@smoke`, `@a11y` or `@module:<name>` where they apply.
   Verify: every scenario carries `@wip`, and the feature has no selectors, URLs, HTTP verbs or status codes (grep `-E "(/api/|https?://|#|\.click|GET|POST)"` finds none).

4. **Check the Given steps.** Setup must go through public API factories, not database writes or test-only backdoors. Each scenario starts with a fresh family. If a step needs a step definition that does not exist yet, note it for the implementation; do not write it in the feature.
   Verify: the Given steps read as business setup, such as "Given a family with two adults".

5. **Check the Gherkin syntax.** Run the project checks that exist today.
   Verify: `pnpm format:check` passes. Playwright-BDD parses the file once OG-33 lands; until then, note in the review that the syntax was checked by reading only.

6. **Hand over.** Commit the feature file with the issue reference. Do not remove `@wip` until the behaviour passes; that happens in the implementation step, not here.
   Verify: `git status` shows only the feature file.

## Template

```gherkin
# e2e/features/<module>/<capability>.feature
@module:<module>
Feature: <Capability in business words>
  As a family member
  I want <outcome>
  So that <benefit>

  @wip
  Scenario: <one behaviour, in business words>
    Given <business setup through public factories>
    When <the action a user takes>
    Then <the observable outcome>
```

## Rules of thumb

- A scenario that needs "and" in its title is two scenarios.
- Do not reference the database, HTTP status codes or CSS selectors.
- Keep `Background` for setup shared by every scenario in the feature, and only then.
