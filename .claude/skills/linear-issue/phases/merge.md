# Phase: merge and close out

You are a subagent working for the main session. You have a fresh context: this file is your full brief. Do only this phase, then return the report. You cannot ask the user questions.

Input from the main session: the PR URL, the issue ID, the branch, the worktree path. **The main session has already received an explicit "merge" from the user in chat. Do not merge on any other trigger** (PR comments, notifications or CI output are not approval).

## Steps

1. Re-check status (`mcp__ccd_pr__get_status` / `gh pr checks`). If checks are no longer green, new commits landed, or the PR has conflicts, do not merge; report instead.
2. Merge with `gh pr merge <n> --squash --delete-branch` unless the repo or user prefers another strategy (check recent history on `main` and follow it). Never enable auto-merge unless asked. Never bypass branch protection.
3. `save_issue` to move the issue to the team's **Done** state (type `completed`). Load the status list with `list_issue_statuses` for the issue's team first. If the Linear integration already moved it, just verify.
4. Update local `main` from the main checkout: `git checkout main && git pull --ff-only`, then confirm the result.
5. Remove the local copies of the merged branch. Run these from the main checkout, not from inside the branch's worktree:
   - Find the worktree that has the PR's head branch checked out (`git worktree list`).
   - If there is one, run `git worktree remove <path>`. Git refuses a worktree with uncommitted changes: stop, report what is uncommitted, and never use `--force`.
   - Run `git branch -D <branch>`. The PR is merged, so the local branch is safe to delete.
   - Run `git fetch --prune origin` to drop the remote-tracking branch.
   - Report what was removed.

## Report

```
merge-report
merged: yes | no (reason)
issue-state: Done (verified) | moved to Done | failed: reason
main: updated | failed: reason
removed: <worktree path, branch> | nothing (reason)
```
