# Phase: push, pull request and screenshots

You are a subagent working for the main session. You have a fresh context: this file is your full brief. Do only this phase, then return the report. You cannot ask the user questions and you cannot spawn other agents.

Input from the main session: the `pickup-report` (issue ID, title, branch, worktree), the `implement-report`, and the `review-summary` (the pre-pr-verify result). **Only run this phase after the user has approved the change at Gate 1 and pre-pr-verify has passed.** If the input does not confirm both, stop and report.

Work inside the worktree path from the pickup report.

## Steps

1. **UI screenshots first, when the diff touches `apps/main-web/` or `packages/ui/`.** Run the `@ui` scenarios of each changed feature with `E2E_SCREENSHOTS=1` (screenshots are off without it), so `e2e/artifacts/screens/<feature>/` holds the PNGs. Upload them to the Linear issue instead of listing them in chat. Do not create the PR until the upload comment exists; if screenshots cannot be produced, stop and report why.
   - Upload every variant: each screen in light and dark theme, at desktop and mobile width (the folder holds `<screen>.png` light desktop, `<screen>-mobile.png` light mobile, `<screen>-dark.png` dark desktop and `<screen>-dark-mobile.png` dark mobile). For each path, one file at a time (a signed URL lasts 60 seconds): `prepare_file_upload` (`filename` = the file's basename, `contentType` `image/png`, exact byte `size`), then `curl -X PUT --data-binary @<path>` with every header from `uploadRequest.headers` verbatim, then keep the returned markdown.
   - Post all markdown in a single `save_comment` on the issue, headed `UI screenshots (<branch>, <short sha>)`. Group the comment by screen: one `**<Screen name>**` section per screen, and inside it one line per variant in this order: Light, desktop; Light, mobile; Dark, desktop; Dark, mobile. Every screen in the same section shares the same variants, so the same screen never appears in two sections.
   - If an upload or the comment fails, say so and list the local paths instead.
   - This is not only a PR-time step: any later push that changes `apps/main-web/` or `packages/ui/` needs a new screenshot comment (see ci-fix.md for the CI-fix case).
2. Push the branch: `git push -u origin <branch>`. Retry network errors up to 4 times with backoff.
3. Create the PR with `gh pr create` against `main`:
   - Title: `<issue title> (OG-16)`.
   - Body: summary, notable decisions, how it was tested, and the Linear link. Include the identifier (e.g. `Closes OG-16`) so the Linear GitHub integration associates it. No attribution lines.
   - If the repo has a PR template, mirror its headings. Skip any section asking for credentials, environment variables, internal hostnames or anything unrelated to the diff.
4. Link the PR to the Linear issue: `create_attachment` on the issue with the PR URL and title (skip if the GitHub integration already attached it - check `get_issue`'s attachments). Optionally `save_comment` with the PR link.
5. Report the PR URL to the main session. The main session binds the PR to the session (`mcp__ccd_pr__get_status` / `bind_pr`); do not call those yourself unless the main session told you to.

## Report

```
pull-request-report
pr: <URL>
pushed: yes | no (reason)
screenshots-comment: <link> | not needed (no UI change) | failed: reason, local paths
attachment: created | already attached | failed: reason
```
