# Workflow

This page describes how work moves from a Linear issue to a merged pull request. It applies to contributors and to agents working in this repository. [CLAUDE.md](../CLAUDE.md) holds the non-negotiables and the Definition of Done, and [CONTRIBUTING.md](../CONTRIBUTING.md) covers the DCO sign-off and the checks to run locally.

## Branches and commits

- Branch names are the Linear `gitBranchName`, for example `dwadoch/og-24-add-pr-template-issue-conventions-and-agent-workflow-doc`. Create the branch from an up-to-date `main`.
- Commit messages use Conventional Commits: `type(scope): imperative summary`, with the issue key at the end, for example `docs: add PR template and workflow guide (OG-24)`. Use `git log` to match the style of recent commits.
- Every commit is signed off with `git commit -s` ([CONTRIBUTING.md](../CONTRIBUTING.md)). Check the range with `pnpm dco:check`.
- Agents never push to `main` and never force-push. Changes reach `main` through a pull request.

## Writing a Linear issue

Every issue has these sections, in this order. The templates in [`.github/ISSUE_TEMPLATE/`](../.github/ISSUE_TEMPLATE/) follow the same structure.

1. **Context.** Why the work matters and what it depends on.
2. **Goal.** The outcome, in one or two sentences.
3. **Scope.** The concrete deliverables.
4. **Gherkin scenarios.** The behaviour to specify, in business language. Each scenario is copied into a `.feature` file as the first commit of the change.
5. **Acceptance criteria.** Observable conditions that show the goal is met.
6. **Out of scope.** What the issue deliberately leaves out.

Blocking relations in Linear mean the blocked issue waits until its blockers are Done.

## Feature-first flow

1. Put the scenarios from the issue into `e2e/features/<module>/<name>.feature`, tagged `@wip`. Commit this on its own so the reviewer sees the behaviour before the code.
2. Implement the change and add unit and integration tests.
3. Remove `@wip` from each scenario once it passes. Scenarios that still fail stay tagged, and each one is listed in the pull request.

Changes with no user-visible behaviour, such as documentation or tooling, may skip the feature file. The pull request says so under "Feature files".

## Pull requests

- The title starts with the Linear key, for example `OG-24 Add PR template, issue conventions and agent workflow doc`.
- The body follows [`.github/pull_request_template.md`](../.github/pull_request_template.md). It links the issue with `Closes OG-NN`, which the Linear GitHub integration uses to attach the pull request.
- Run every gate in [pre-pr-verify](../.claude/skills/pre-pr-verify/SKILL.md) before creating the pull request, not after. That includes the review agents in [.claude/agents](../.claude/agents/): architecture, privacy, code quality, and Gherkin when the diff has feature files. Each Blocking finding is fixed before the pull request is opened. The required checks are listed in [docs/ci.md](ci.md).
- The owner reviews every change ([CODEOWNERS](../.github/CODEOWNERS)).

### Sample pull request description

```markdown
## Linked issue

Closes OG-24

## Summary

Adds the pull request template, the bug and task issue templates, and this workflow guide.

## Decisions

Issue templates use Markdown rather than YAML forms so they read the same as this guide.

## Feature files

None (no user-visible behaviour).

## Checklist

- [x] Tests added or updated, and `pnpm test` passes
- [x] `pnpm lint`, `pnpm typecheck`, `pnpm format:check` and `pnpm check:boundaries` pass
- [x] E2E smoke passes, or the change has no user-visible behaviour
- [x] No `@wip` tag is left on finished work
- [x] ADR written if a decision changed
- [x] Docs updated
- [x] Every commit is signed off

## Open `@wip` scenarios

None.

## How it was tested

`pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm dco:check` run locally.

## Risks and privacy impact

None.
```

## Owner steps

These steps happen in the web interfaces and cannot be set from code. The owner does them once:

- Link the Linear and GitHub integration in Linear's settings, so pull requests attach to issues and merged pull requests move issues to Done.
- Mark the required CI checks in **Settings → Branches** for `main`, as listed in [docs/ci.md](ci.md).

## Rules for agents

- Do not push to `main` and do not force-push.
- Do not change CI, branch protection or agent settings to make a change pass. Fix the cause ([CLAUDE.md](../CLAUDE.md)).
- Do not skip or weaken tests, lint rules or hooks, and do not use `--no-verify`.
