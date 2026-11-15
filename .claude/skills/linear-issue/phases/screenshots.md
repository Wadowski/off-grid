# UI screenshots

The single source for how UI screenshots are captured, reviewed and uploaded. Other files link here and do not restate it.

## When

Any push that changes `apps/main-web/` or `packages/ui/` needs current screenshots on the linked Linear issue: the first push, and every later push (CI fixes and review fixes included). The issue must always show the current UI.

## Capture once

Run `pnpm ui:screens`. It runs the `@ui` scenarios with `E2E_SCREENSHOTS=1`, writes `e2e/artifacts/screens/manifest.json`, and builds one contact sheet per screen (`<screen>-sheet.png`: light desktop, light mobile, dark desktop, dark mobile in a 2x2 grid).

It reuses the previous capture while the UI sources, the feature files and the commit are unchanged, so the implement step, the UI reviewer and the upload share one capture. Use `--force` only when a capture looks stale. Never run the `@ui` scenarios by hand for this.

## Design comparison (implement step)

Compare each changed screen's contact sheet with its design screenshot from the plan, in light and dark, desktop and mobile. Fix layout, spacing, tokens, typography, colours and states until they match. Where the plan says the implementation is the decision, match the plan. Ignore naming, text and logo differences.

## Upload

One image per screen, not four.

1. For each manifest screen, one file at a time (a signed URL lasts 60 seconds): `prepare_file_upload` (`filename` = the sheet's basename, `contentType` `image/png`, exact byte `size`), then `curl -X PUT --data-binary @<path>` with every header from `uploadRequest.headers` verbatim, then keep the returned markdown.
2. Post all markdown in one `save_comment` on the issue, headed `UI screenshots (<branch>, <short sha>)`, with one `**<Screen name>**` section per screen.
3. If an upload or the comment fails, say so and list the local paths.

Upload runs in parallel with the push and PR creation: do not hold the PR for it, but do not report the push as done until the comment exists.
