---
name: pre-pr-verify
description: Run every verification gate before opening a pull request - pnpm verify, the changed feature scenarios, the no-@wip rule, the review subagents and the PR template. Use before creating or marking a PR ready, or when the user asks to verify the branch before review or merge.
---

# pre-pr-verify

The Definition of Done is in [CLAUDE.md](../../../CLAUDE.md). Run this from the main session, because the reviewers are agents and subagents cannot launch agents. Do not re-run a step that already passed on the same tree.

## Steps

1. **Clean tree.** `git status --short` prints nothing and `git log --oneline origin/main..HEAD` lists only this branch's commits. Commit first if not: the next step fingerprints the tree.

2. **`pnpm verify`.** One command runs lint, typecheck, format, tests, boundaries, agent config, telemetry, licence headers, DCO, `@wip` tags, `check:rules`, and `lint:features`, `check:contracts` and `build` when they apply. It runs in parallel and prints only failures. If the implement step already passed on this exact tree the result is cached and costs nothing.
   Verify: it prints `verify: pass`. A failure names the check; fix and re-run. Only failed checks run again.

3. **Changed scenarios.** `pnpm e2e:changed` is the only local e2e command. It runs the feature files this branch changed and the scenarios of the modules its code changes affect, and says why each was chosen. Do not run `pnpm e2e`, `pnpm e2e:smoke`, `pnpm e2e:wip`, `pnpm e2e:affected` or `playwright test` directly; the wider affected set is CI's job.
   Verify: it exits 0, or says no scenario is affected.

4. **No `@wip` on finished work.** `pnpm check:wip-tags` (part of verify) fails on a changed feature with `@wip` that the PR body does not list. List each open `@wip` scenario in the PR body with the reason.

5. **UI screens, when the diff touches `apps/main-web/` or `packages/ui/`.** `pnpm e2e:changed --screens` captures once, with the same scope as step 3, as [screenshots.md](../linear-issue/phases/screenshots.md) says. Never take screenshots any other way. Upload happens at PR time, per [screenshots.md](../linear-issue/phases/screenshots.md).
   Verify: `e2e/artifacts/screens/manifest.json` lists every changed screen.

6. **Review, once, in parallel.** Get the inputs once:
   - `BASE=origin/main` (run `git fetch origin main` first) and `git diff --stat $BASE...HEAD`
   - `pnpm rules:for --review-only` for the changed files

   Then launch these in one message, passing the base, the changed-file list and (to `quality-reviewer`) the rules output:
   - `design-reviewer` always
   - `quality-reviewer` always
   - `gherkin-reviewer` when the diff has `.feature` files
   - `ui-screenshot-reviewer` when step 5 applies

   They only report.

7. **Fix in one pass.** Collect every Blocking finding and fix them together (the implement subagent with all findings as input, or directly for a trivial one). Fix each Advisory finding or keep a one-line reason for it. Then `pnpm verify` again. Re-review only the reviewers whose area the fixes touched, and only the changed files. Stop after two rounds and report what remains.
   Verify: no Blocking finding is left.

8. **PR body.** Fill [.github/pull_request_template.md](../../../.github/pull_request_template.md): linked issue, summary, decisions, feature files, checklist, open `@wip` scenarios, how it was tested, risks and privacy impact, plus the Advisory findings kept with their reasons.

## Report (`review-summary`)

State each gate's result: `verify`, `e2e:changed` (or none), screens captured, each reviewer's Blocking and Advisory outcome, and rounds used. A gate that was skipped is reported as skipped with the reason. Never report a gate as passing if it did not run.
