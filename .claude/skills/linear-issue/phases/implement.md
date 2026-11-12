# Phase: implement the plan

You are a subagent working for the main session. You have a fresh context: this file is your full brief. Do only this phase, then return the report. You cannot ask the user questions. The plan has already settled the design, so you do not re-design. If the plan cannot be followed, stop and report it.

Input from the main session: a `pickup-report` block (issue ID, branch, worktree path) and the path to the plan file, which the planning phase wrote. Read the plan file completely before you start. Work **only inside the worktree path** from the pickup report. Never touch the main checkout or another issue's worktree. **Do not push. Do not open a PR. Do not change Linear.**

## Follow the plan

- Take the steps in the plan's order. Make one commit per step, unless the plan says otherwise.
- Do not start a step marked `blocked-on`. Stop and report the blocked steps.
- Run each step's check before moving to the next step.
- If the plan is wrong about the code (a file is missing, an API differs), fix the smallest thing that makes the plan work, and record it under `deviations` in the report. If a fix would change the design, stop and report it instead.
- Do not add anything the plan does not list. Mention unrelated findings in the report instead.

## Build rules

- The repo's workflow: the Gherkin `.feature` file comes first when the plan has one, then implementation, then verification.
- **UI must match the plan's UI design 1 to 1**: layout, spacing, tokens, typography, colors and states, for the scope the plan names. Leave the rest of any page alone, even if it looks misaligned. If the plan has a screen with no design, stop and report it.
- **Compare with screenshots, not just code.** After the UI changes, run the `@ui` scenarios with `E2E_SCREENSHOTS=1` and compare each changed screen's e2e screenshot with its design screenshot from the plan, in light and dark, desktop and mobile. Fix layout, spacing, tokens, typography, colors and states until they match. Where the plan says the implementation is the decision (the design is stale), match the plan, not the design. Ignore differences in naming, texts and logo. Record each comparison in the report.
- Follow surrounding code conventions. This is a pnpm + turbo monorepo: use `pnpm`, not npm/yarn.
- Add or update the tests the plan lists.
- Follow surrounding code conventions. This is a pnpm + turbo monorepo: use `pnpm`, not npm/yarn.
- Add or update tests for the behavior.
- Run the checks that CI runs and fix failures: `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test`, plus `pnpm build` if build output could be affected. Run `BASE_REF=origin/main pnpm e2e:affected` for the scenarios the change touches; the full e2e suite is not run on a branch. Run them scoped (`pnpm --filter <pkg> ...` / `turbo --filter`) when only one package changed, then the full set once before handing over.
- If the change affects a published package, add a changeset (`pnpm changeset`) the way existing ones in `.changeset/` look.
- Commit in logical commits on the branch: `git commit -s` (DCO sign-off, see CONTRIBUTING.md). Messages: imperative, reference the issue (`... (OG-16)`), matching `git log` style. Do not add attribution or co-author lines. Never use `--no-verify`.

## Report

```
implement-report
status: ready-for-review | blocked
plan-steps: <done>/<total> (blocked: <step numbers and reason>)
deviations:
- ...            (plan vs. reality, and the smallest fix applied)
commits:
- <sha> <subject>
changed-areas: <packages/modules touched>
ui-changed: yes | no          (yes if apps/main-web/ or packages/ui/ changed)
design-comparison:            (only if ui-changed: yes)
- <screen>, light/dark, desktop/mobile: matches | differs (what) | matched plan over stale design
acceptance-criteria:
- <criterion>: met | not met | not verified, with evidence
checks:
- pnpm typecheck: pass | fail | not run (reason)
- pnpm lint: ...
- pnpm format:check: ...
- pnpm test: ...
- pnpm build: ... (or "not needed: why")
not-verified:
- ...
assumptions:
- ...
unrelated-findings:
- ...
```

Report failing tests and skipped checks as they are. Do not mark a criterion met without evidence.
