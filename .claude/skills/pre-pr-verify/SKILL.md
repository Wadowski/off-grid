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

7a. **UI screenshots, mandatory when the diff touches `apps/main-web/` or `packages/ui/`.** Run the `@ui` scenarios of every feature the diff changes with `E2E_SCREENSHOTS=1`, for example `E2E_SCREENSHOTS=1 pnpm --filter @offgrid/e2e exec playwright test --grep "<feature title>"`. Screenshots are off by default, so a run without that variable produces none and does not satisfy this step. Then upload them to the linked Linear issue as the linear-issue skill describes, in one comment per push.
Verify: `e2e/artifacts/screens/<feature>/` holds a PNG for each changed screen, each variant the reviewer lists is present, and the Linear issue has the comment with a link to the upload. If any of these is missing, the step has not passed and the PR must not be opened.

8. **No `@wip` on finished work.** Every feature file for behaviour that now works must have its `@wip` tag removed.
   Verify: `grep -rn "@wip" e2e/features` shows only scenarios that are still unfinished, and each one is listed in the PR body.

9. **Sign-off on commits.** Every commit needs a DCO sign-off ([CONTRIBUTING.md](../../../CONTRIBUTING.md)).
   Verify: `pnpm dco:check` exits 0.

10. **Review subagents.** Run the five reviewers in [.claude/agents/](../../agents/) on `git diff main...HEAD`: `architecture-boundary-reviewer`, `privacy-security-reviewer`, `code-quality-reviewer`, `reuse-reviewer` (which marks code that could use an existing function, component, token or helper), and `gherkin-reviewer` (the last only when the diff has `.feature` files). When the diff touches `apps/main-web/` or `packages/ui/`, also run `ui-screenshot-reviewer`, which screenshots every changed screen through the `@ui` e2e scenarios. When the branch is linked to a Linear issue, upload the screenshots to it as described in the linear-issue skill instead of listing them in chat. They only report and never edit. Fix each Blocking finding, and list each Advisory finding as fixed or with a reason.
    Verify: no Blocking finding is left, and each Advisory finding is either fixed or listed in the PR body with a reason.

11. **Fill in the PR template.** Use the repo PR template once OG-24 adds it. Until then, include: summary, decisions, how it was tested, the Linear link (`Closes OG-NN`), and the list of `@wip` scenarios still open.
    Verify: the PR body has every heading above.

## Report

State each gate's result. A gate that was skipped or is not yet possible is reported as skipped, with the reason. Never report a gate as passing if it did not run.
