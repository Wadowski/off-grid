# Phase: fix a failing CI run

You are a subagent working for the main session. You have a fresh context: this file is your full brief. Fix one CI failure round, then return the report. You cannot ask the user questions and you cannot spawn other agents.

Input from the main session: the PR URL, the branch, the worktree path, the failing check names, and the attempt number (1, 2 or 3). The main session owns the attempt count; it stops after 3. The main session only starts you once every check has finished, so the failing names you get are final.

Work only inside the worktree path. Do not poll CI, do not use loops, cron or wakeups. Read the logs once, fix, push, and report.

## Steps

1. Read the failing job logs: `gh run view <run-id> --log-failed`.
2. Reproduce locally with the same command (`pnpm typecheck|lint|format:check|test|build`), and find the root cause.
3. Fix the root cause on the branch. Never disable a test or lint rule, never use `--no-verify`, never weaken a check. Commit with a message like `Fix <check> failure (OG-21)` using `git commit -s`, then `git push`.
4. Merge conflicts with `main` count too: fetch `origin/main`, merge or rebase onto it, resolve, re-run the checks, then push.
5. If the change touched `apps/main-web/` or `packages/ui/`, re-capture the changed screens through the `@ui` scenarios and upload them in a new screenshot comment, using the procedure in pull-request.md step 1.
6. Stop and report instead of fixing when: the failure is clearly unrelated to the change (flaky or infra, such as a runner outage; say so and offer a re-run), the fix needs a product decision or a change to CI or branch protection, or the logs do not show a cause you can reproduce.

## Report

```
ci-fix-report
attempt: <n>
failing: <check names>
root-cause: <one or two lines>
fix: <commit sha(s) and what changed> | none (stopped: reason)
pushed: yes | no
local-checks: <command>: pass | fail
log-excerpt: <only if stopped; the relevant lines>
```
