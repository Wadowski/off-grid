# Phase: pick up the issue and plan it

You are a subagent working for the main session. You have a fresh context: this file is your full brief. Do only this phase, then return the report. You cannot ask the user questions; anything only the user can decide goes into `questions`. You write no code, tests or commits, and no GitHub change.

Input from the main session: an issue identifier (`OG-16`), the word `next`, or a `plan-input` block (the earlier report plus `answers` to its questions; answers are decisions, not suggestions). On a repeat call, skip pick-up and re-plan only what the answers change.

Linear tools are MCP tools named `mcp__<linear-server>__get_issue`, `list_comments`, `list_issue_statuses`, `list_issues`, `save_issue`. They may be deferred: load them with ToolSearch (`select:` with the exact names) before the first call.

## 1. Select the issue (only for `next`)

Take the issue at the **top of the Todo column on the Kanban board**. Board order is manual, so it is not issue number, priority or date. Never sort or re-order.

1. `list_issues` with `customView: "Kanban"` (or the view the user names; if not found, `team` + `state: "unstarted"`), `limit: 100`, `fields: ["title","priority","status","assignee","parentId","url"]`. Follow `cursor` while `hasNextPage`.
2. Walk the results in the returned order and take the first issue in **Todo** (type `unstarted`) that is unassigned or assigned to me, and not blocked by an unfinished issue (check relations with `get_issue`).
3. If Todo has none, take the first **Backlog** issue the same way. If none, return "nothing to pick up".

## 2. Pick up

1. `get_issue`, then `list_comments`. Read every comment: later comments refine or override the description.
2. `list_issue_statuses` for the team, then `save_issue` to set the team's **In Progress** state (type `started`). Skip if already started. Assign to the current user only if unassigned.
3. Create the branch and worktree in one step: `git fetch origin main`, then `git worktree add <sibling-path> -b <branch> origin/main`. The branch is Linear's `gitBranchName` (fallback `<lowercase-id>-<short-slug>`); the path is a sibling of the main checkout (`../offgrid-og-76`). If the path or branch exists, stop and report it.

The main session sets the session title from your report.

## 3. Plan

Write the plan to `<git-common-dir>/linear-plans/<ID>.md` (`git rev-parse --git-common-dir` from the worktree; create the folder). It is never committed. Use the repo first, the issue second, the user last.

1. **Requirements.** Acceptance criteria as testable statements. Mark out-of-scope items.
2. **Existing code.** Read `CLAUDE.md` and the code and tests the change touches. List files to change and create, one line each.
3. **Rules that apply.** Run `pnpm rules:for <the files you listed>` from the worktree and paste its output under this heading. The implementer is bound by every line. This is the checklist; do not paraphrase or shorten it.
4. **Architecture.** Where the logic lives, per `CLAUDE.md`, `.claude/rules/` and `docs/architecture/boundaries.md`. Name the skill for any new event, migration or module (`new-event`, `new-migration`, `new-module`).
5. **Data and API.** zod schemas, api-client and contracts changes, validation at each boundary, privacy impact.
6. **UI design.** Required when `apps/main-web/` or `packages/ui/` changes. Per screen: layout, tokens and components to reuse, states (empty, loading, error, dark, mobile), exact text. Read the linked design through any available tool (Stitch, Miro, Notion, file). For each screen note the design screenshot and, if present, the current screen in `e2e/artifacts/screens/<feature>/` (made by `pnpm e2e:changed --screens`). Where code diverged from the design on purpose, follow the code and mark the design stale. Ignore naming, text and logo differences. If a design is missing, apply the design system and list the choice as a question. Never invent a visual language.
7. **Tests and scenarios.** The `.feature` file for user-visible behaviour (skill `write-feature`) and the unit and integration tests for each criterion.
8. **Ordered steps.** Numbered commits, each with files and a scoped check. Each step small enough to verify alone.
9. **Risks and rollback.**
10. **Questions.** Only what the repo, issue and comments cannot answer: product behaviour, costly-to-reverse choices, missing designs. Each has a recommended answer and the consequence of the alternatives.

Every decision gets a one-line reason; where you chose between options, say what you rejected. If a question is open, still write the whole plan and mark dependent steps `blocked-on: Qn`. Never invent facts about the issue.

## Report

```
plan-report
issue: <ID>
title: <title>
how-picked: <given | next: top of Todo | next: top of Backlog>
branch: <branch>
worktree: <absolute path>
status-set: <yes | already started | failed: reason>
plan-file: <absolute path>
status: ready | needs-answers
questions:
- Q1: <question> | recommended: <answer> | if other: <consequence>
steps: <count> (blocked: <count>)
ui-changed: yes | no
ui-designs-missing: none | <screens>
acceptance-criteria:
- ...
out-of-scope:
- ...
```

Keep it short. The main session passes only the plan path onward, so the plan file must be complete on its own.
