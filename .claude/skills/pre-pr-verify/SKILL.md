---
name: pre-pr-verify
description: Run every verification gate before opening a pull request - repo checks, e2e, the no-@wip rule, the review subagents and the PR template. Use before creating or marking a PR ready, or when the user asks to verify the branch before review or merge.
---

# pre-pr-verify

The Definition of Done is in [CLAUDE.md](../../../CLAUDE.md). This skill runs it in the order that fails fastest. Stop at the first failing step, fix it, and start again from the top.

## Steps

1. **Confirm the branch is current.** The branch must be based on an up-to-date `main`, with no uncommitted changes.
   Verify: `git status --short` prints nothing, and `git log --oneline main..HEAD` lists only this branch's commits.

2. **Lint and typecheck.**
   Verify: `pnpm lint && pnpm typecheck` both exit 0.

3. **Format, headers and licences.**
   Verify: `pnpm format:check && pnpm license:headers:check && pnpm reuse:lint` all exit 0.

4. **Tests.** Run the unit and integration tests.
   Verify: `pnpm test && pnpm test:scripts` both exit 0.

5. **Boundaries and agent config.** Module boundaries and the `.claude/` configuration.
   Verify: `pnpm check:boundaries && pnpm check:agent-config` both exit 0.

6. **Build, if output could change.** Run the build when a package's build output could be affected.
   Verify: `pnpm build` exits 0.

7. **End-to-end.** Run the e2e suite. Until OG-33 adds a smoke tag, `pnpm e2e` is a placeholder that only prints a message; say so in the report instead of treating it as a pass.
   Verify: `pnpm e2e` exits 0, and the report states whether real scenarios ran.

8. **No `@wip` on finished work.** Every feature file for behaviour that now works must have its `@wip` tag removed.
   Verify: `grep -rn "@wip" e2e/features` shows only scenarios that are still unfinished, and each one is listed in the PR body.

9. **Sign-off on commits.** Every commit needs a DCO sign-off ([CONTRIBUTING.md](../../../CONTRIBUTING.md)).
   Verify: `pnpm dco:check` exits 0.

10. **Review subagents.** Run the four reviewers in [.claude/agents/](../../agents/) on `git diff main...HEAD`: `architecture-boundary-reviewer`, `privacy-security-reviewer`, `code-quality-reviewer`, and `gherkin-reviewer` (the last only when the diff has `.feature` files). They only report and never edit. Fix each Blocking finding, and list each Advisory finding as fixed or with a reason.
    Verify: no Blocking finding is left, and each Advisory finding is either fixed or listed in the PR body with a reason.

11. **Fill in the PR template.** Use the repo PR template once OG-24 adds it. Until then, include: summary, decisions, how it was tested, the Linear link (`Closes OG-NN`), and the list of `@wip` scenarios still open.
    Verify: the PR body has every heading above.

## Report

State each gate's result. A gate that was skipped or is not yet possible is reported as skipped, with the reason. Never report a gate as passing if it did not run.
