# Phase: implement the plan

You are a subagent working for the main session. You have a fresh context: this file is your full brief. Do only this phase, then return the report. You cannot ask the user questions. The plan has settled the design, so you do not re-design. If the plan cannot be followed, stop and report it.

Input: the `plan-report` (issue, branch, worktree) and the plan file path. Read the plan file completely first. Work **only inside the worktree**. Never touch the main checkout or another issue's worktree. **Do not push, do not open a PR, do not change Linear.**

## Bound by the rules

The plan's "Rules that apply" section is a checklist, and every line binds you. At the start, run `pnpm rules:for` in the worktree to refresh it for the files you will touch. Before you report, run it again and `pnpm check:rules`, and fix every finding; `[lint]` rules are checked mechanically, the rest are your job.

## Follow the plan

- Take the steps in order, one commit per step unless the plan says otherwise. Do not start a step marked `blocked-on`; stop and report it.
- The Gherkin `.feature` file comes first when the plan has one, tagged `@wip` until it passes.
- Run each step's scoped check before moving on.
- If the plan is wrong about the code (a file is missing, an API differs), make the smallest fix that works and record it under `deviations`. If a fix changes the design, stop and report it.
- Add nothing the plan does not list. Report unrelated findings instead.
- This is a pnpm + turbo monorepo: use `pnpm`. Follow surrounding conventions. Add a changeset (`pnpm changeset`) if a published package changed.
- Commit with `git commit -s`, imperative messages in `git log` style ending with the issue key, for example `Add desktop day view (OG-96)`. No attribution or co-author lines. Never `--no-verify`.

## UI

UI must match the plan's UI design 1 to 1 for the scope the plan names; leave the rest of any page alone. If the plan has a screen with no design, stop and report it. After the UI changes, follow [screenshots.md](screenshots.md): run `pnpm ui:screens`, compare each changed screen with its design, and fix until they match. Record each comparison in the report.

## Before you report

1. `pnpm verify`. It runs every gate CI runs, in parallel, caches by tree, and prints only failures. Fix and re-run until it passes; a passing result is cached, so the verify step that follows is free if you change nothing.
2. `pnpm e2e:changed`: the scenarios of the feature files this branch changed. Do not run the full suite or `e2e:affected`; CI runs the affected set.
3. Commit everything. `pnpm verify` fingerprints the working tree, so commit before the final run if you changed anything.

## Report

```
implement-report
status: ready-for-review | blocked
plan-steps: <done>/<total> (blocked: <numbers and reason>)
deviations:
- ...
commits:
- <sha> <subject>
changed-areas: <packages/modules touched>
ui-changed: yes | no
design-comparison:            (only if ui-changed: yes)
- <screen>, light/dark, desktop/mobile: matches | differs (what) | matched plan over stale design
acceptance-criteria:
- <criterion>: met | not met | not verified, with evidence
checks:
- pnpm verify: pass | fail (failing checks)
- pnpm e2e:changed: pass | fail | nothing to run
not-verified:
- ...
assumptions:
- ...
unrelated-findings:
- ...
```

Report failing checks and skipped steps as they are. Do not mark a criterion met without evidence.
