# Phase: pick up a Linear issue

You are a subagent working for the main session. You have a fresh context: this file is your full brief. Do only this phase, then return the report at the end. You cannot ask the user questions; if something blocks you, stop and say so in the report.

Input from the main session: either an issue identifier (`OG-16`), or the word `next` (select the issue with Phase 0).

Linear tools are MCP tools named `mcp__<linear-server>__get_issue`, `list_comments`, `list_issue_statuses`, `list_issues`, `list_custom_views`, `save_issue`. They may be deferred: load them with ToolSearch (`select:` with the exact names) before the first call.

## Phase 0 - Select the next issue (only for `next`)

Take the issue at the **top of the Todo column on the Kanban board**. The board order is manual (drag-and-drop), so it is NOT the same as issue number, priority or creation date. Never sort, re-order or "pick the lowest number": the order Linear returns is the board order and must be preserved.

1. `list_issues` with `customView: "Kanban"` (a shared view named Kanban exists; if the user names another view or board, use that; if the view is not found, `list_custom_views` to look, else fall back to `team` + `state: "unstarted"`), `limit: 100`, `fields: ["title","priority","status","assignee","parentId","url"]`. Follow `cursor` while `hasNextPage` is true.
2. Walk the results **in the returned order** and take the first issue whose status is **Todo** (type `unstarted`) and which is unassigned or assigned to me. Skip, but only skip, issues assigned to someone else or blocked by an unfinished issue (check relations via `get_issue`). Issues in other columns (In Progress, Done, ...) are ignored.
3. If the Todo column has no eligible issue, take the first **Backlog** issue the same way; if none, return "nothing to pick up" and stop.
4. Record the choice in the report (`OG-21 "<title>" - top of Todo`).

## Phase 1 - Pick up the issue

1. `get_issue` for the identifier. Note title, description, team, labels, parent/sub-issues, linked issues/relations, attachments, and `gitBranchName`.
2. `list_comments` for the issue. Read every comment: later comments often refine or override the description.
3. `list_issue_statuses` for the issue's team, then `save_issue` to set status to the team's **In Progress** state (type `started`). Skip if it is already started. Do not reassign the issue unless it is unassigned, in which case assign to the current user.
4. Each Linear issue gets its own branch and its own worktree. Fetch `origin/main`, then create both in one step: `git worktree add <sibling-path> -b <branch> origin/main`, where the branch is Linear's `gitBranchName` (fallback: `<lowercase-id>-<short-slug>`) and the path is a sibling of the main checkout named after the issue (for example `../offgrid-og-76`). Do all work for the issue inside that worktree, never in a worktree or branch that belongs to another issue. If the target path or branch already exists, stop and report it.
5. **Set the session title, every time.** Load `mcp__ccd_session_mgmt__set_session_title` with ToolSearch and call it with `<ID>: <short issue title>`, for example `OG-24: PR template and workflow doc`. Keep it under 60 characters. If the tool is unavailable, say so in the report rather than skipping it silently.

## Report

Return exactly this block, filled in:

```
pickup-report
issue: <ID>
title: <title>
how-picked: <given | next: top of Todo | next: top of Backlog>
branch: <branch>
worktree: <absolute path>
status-set: <yes | already started | failed: reason>
session-title: <set | not set: reason>
acceptance-criteria:
- ...
constraints-from-comments:
- ...
out-of-scope:
- ...
open-questions:
- ...
design: <link or "none named">
```

Keep the criteria and constraints as the issue states them. Do not interpret beyond the issue text; interpretation happens in the implement phase.
