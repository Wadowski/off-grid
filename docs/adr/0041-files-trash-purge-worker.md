# 0041. Files trash, purge and the retention worker

- **Status:** Accepted

## Context

[OG-117](https://linear.app/offgridos/issue/OG-117) adds the trash routes, restore, permanent delete and the worker that removes trash older than the retention period. [0034](0034-files-access-model-trash-and-versions.md) sets the model: trash is `deleted_at` on a row, and a trashed folder hides its children. [0039](0039-delete-non-current-version-and-restore-copies-bytes.md) makes every version key unique, so a purged key is never shared.

## Decision

### 1. Trash marks the selected row only

`POST /files/:id/trash` sets `deleted_at` on that row and bumps its version. Descendants are not marked. The live-ancestor checks that every read and write path already has hide them. Marking every descendant costs one write per item and makes partial restores hard, so it was rejected.

Trash and restore publish `file-updated-v1`, with `deletedAt` in the payload. No new event type is needed.

### 2. Restore goes back to the original parent when the chain is live

`POST /files/:id/restore` returns the row to its original parent when that parent and its whole chain are live. Otherwise it goes to the drive root. A live sibling with the same name gives the restored row a `(n)` suffix, chosen from the live sibling names. A race on the unique index still answers 409 `NAME_TAKEN`.

[0034](0034-files-access-model-trash-and-versions.md) section 6 says that restoring an item under a trashed ancestor also sets `deleted_at` on the ancestor's other children. That case cannot be reached through the routes, because restore accepts only rows whose `deleted_at` is set. This ADR records that sentence as not implemented.

### 3. Purge deletes a subtree in batches, deepest first, under the root lock

Purge removes a trashed row and its subtree. The work is split into batches of 500 rows, ordered deepest first with the root last. Each batch runs in one transaction. It locks the root row with a conditional update, so a restore of the root stops the purge and answers `restored`, which the route maps to 409 `NOT_TRASHED`. It then locks the batch rows with a conditional update on `deleted_at`, so a restore of a nested row either commits before the lock and leaves the row out of the batch, or waits for the purge and then finds the row live. Only rows that are still trashed and still in the subtree are deleted, and one `file-removed-v1` is published per deleted row at `version + 1`. Bytes are deleted after each batch commits, best effort. `DELETE /drives/:id/trash` (empty trash) runs the same purge for each trashed root in turn and has no per-root outcome in its response. If one root fails, the request answers 500, roots already purged stay purged and the remaining roots stay in trash. Repeat the call to finish. A root restored mid-run is skipped and the call answers 204. The retention worker counts a failed root and logs its error name, and a restored or unowned root as skipped. A crash leaves a smaller trashed subtree that the next run finishes. One transaction for a large subtree was rejected because it would exceed the interactive transaction timeout.

The integrity sweep from [0033](0033-file-bytes-on-a-disk-volume.md) remains the backstop for bytes that a failed delete leaves behind.

### 4. The retention worker reads through read-only policies

The worker has no user. It reads expired trashed roots and family memberships through two `SELECT` policies that apply only when the transaction sets `app.files_trash_purge`. Each purge then runs as the owner of the row: its `user_id`, or one current member for a family drive. All writes therefore go through the existing row-level security. A `DELETE` policy keyed on the setting was rejected, because any code that sets it could delete every file. A `SECURITY DEFINER` purge function was rejected because [modules.md](../../.claude/rules/modules.md) forbids it for writes.

A family drive with no current member is skipped and counted. It stays in trash until a member exists.

### 5. Removal events use version plus one

`file-removed-v1` carries `sourceVersion` and payload `version` equal to the row's version plus one, in the cross-owner move and in purge alike. The move previously used the current version, which collided with the last update. The rule holds for a trashed row too: trash bumps the version, so the removal is always newer than the last `file-updated-v1` of that row. No consumer exists yet.

## Consequences

- Trashed data stays on disk and in the database for `OFFGRID_FILES_TRASH_RETENTION_DAYS` days (default 30, range 1 to 3650).
- Purge is destructive and has no undo. The web view, and any permanent-delete prompt in it, is out of scope here.
- The `file-removed-v1` `sourceVersion` changed for moves that already emitted events. No consumer exists yet.
