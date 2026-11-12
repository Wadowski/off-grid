# Phase: analyze and implement

You are a subagent working for the main session. You have a fresh context: this file is your full brief. Do only this phase, then return the report. You cannot ask the user questions: if a requirement is genuinely ambiguous or contradictory, stop before coding and list it under `open-questions`.

Input from the main session: a `pickup-report` block (issue ID, branch, worktree path, acceptance criteria, comments, open questions). Work **only inside the worktree path** from that report. Never touch the main checkout or another issue's worktree. **Do not push. Do not open a PR. Do not change Linear.**

## Phase 2 - Analyze requirements

Build a short internal list of: what must be true when done (acceptance criteria), constraints from comments, out-of-scope items, and open questions.

- Read the repo's `CLAUDE.md`, relevant package/module code, and existing tests before designing.
- Resolve ambiguity from the repo first. If a requirement is still genuinely ambiguous or contradictory, stop and return it as an open question. Do not guess on decisions that are expensive to reverse.
- The repo's workflow: Gherkin `.feature` file first when the change is user-visible (see the `write-feature` skill), then implementation, then verification.

## Phase 3 - Implement

- Implement exactly what the issue asks. No drive-by refactors; mention unrelated findings in the report instead.
- **UI tasks must match the design 1 to 1.** If the issue changes UI (`apps/main-web/` or `packages/ui/`), the result must match the design it refers to exactly: layout, spacing, tokens, typography, colors and states. Scope the match to what the issue is about, not the whole page: if the issue names a specific page or component, align only that page or component and leave the rest of the page alone, even if it looks misaligned. If the issue names no page or component, the scope is the screens the issue describes. If the design for the scope is unclear or missing, stop and return it as an open question.
- Follow surrounding code conventions. This is a pnpm + turbo monorepo: use `pnpm`, not npm/yarn.
- Add or update tests for the behavior.
- Run the checks that CI runs and fix failures: `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test`, plus `pnpm build` if build output could be affected. Run them scoped (`pnpm --filter <pkg> ...` / `turbo --filter`) when only one package changed, then the full set once before handing over.
- If the change affects a published package, add a changeset (`pnpm changeset`) the way existing ones in `.changeset/` look.
- Commit in logical commits on the branch: `git commit -s` (DCO sign-off, see CONTRIBUTING.md). Messages: imperative, reference the issue (`... (OG-16)`), matching `git log` style. Do not add attribution or co-author lines. Never use `--no-verify`.

## Report

```
implement-report
status: ready-for-review | blocked
open-questions:
- ...            (only if blocked; stop coding at the first one)
commits:
- <sha> <subject>
changed-areas: <packages/modules touched>
ui-changed: yes | no          (yes if apps/main-web/ or packages/ui/ changed)
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
