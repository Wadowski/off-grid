# 0041. Files trash, purge and the retention worker

- **Status:** Accepted

## Context

[OG-117](https://linear.app/offgridos/issue/OG-117) adds the trash routes, restore, permanent delete and the worker that removes trash older than the retention period. [0034](0034-files-access-model-trash-and-versions.md) sets the model: trash is `deleted_at` on a row, and a trashed folder hides its children. [0039](0039-delete-non-current-version-and-restore-copies-bytes.md) makes every version key unique, so a purged key is never shared.

## Decision

### 1. Trash marks the selected row only

`POST /files/:id/trash` sets `deleted_at` on that row and bumps its version. Descendants are not marked. The live-ancestor checks that every read and write path already has hide them. Marking every descendant costs one write per item and makes partial restores hard, so it was rejected.

Trash and restore publish `file-updated-v1`, with `deletedAt` in the payload. No new event type is needed.

### 2. Restore goes back to the original parent when the chain is live

The restore locks the trashed chain above the row first (section 3).

`POST /files/:id/restore` returns the row to its original parent when that parent and its whole chain are live. Otherwise it goes to the drive root. A live sibling with the same name gives the restored row a `(n)` suffix, chosen from the live sibling names. A race on the unique index still answers 409 `NAME_TAKEN`.

[0034](0034-files-access-model-trash-and-versions.md) section 6 says that restoring an item under a trashed ancestor also sets `deleted_at` on the ancestor's other children. That case cannot be reached through the routes, because restore accepts only rows whose `deleted_at` is set. This ADR records that sentence as not implemented.

### 3. Purge and restore serialise on the trashed chain

A restore first locks every trashed row above the row it restores, top-down, in its own transaction, before it reads or changes that row. A purge locks its root the same way and then runs the whole purge in one transaction, so the lock is held until the last row is deleted. A restore of any row under a trashed root therefore waits for a purge of that root in progress, then answers not-found or `NOT_TRASHED` as before. Inside the purge transaction the subtree is read once under the lock and deleted deepest first in chunks of 500 rows, with the root last. Each deleted row publishes one `file-removed-v1` at `version + 1`. Bytes are deleted after the commit, best effort. The transaction timeout is five minutes (`TRASH_PURGE_TRANSACTION_TIMEOUT_MS`).

What is guaranteed: a restored folder never loses children to a purge that started before the restore, because the restore cannot commit while the purge holds the root, and a purge never deletes a row that a restore made live. Every operation that deletes or restores a row under a trashed root takes the chain lock first, so no two transactions wait on each other's row locks in a cycle. Purges of different roots touch disjoint rows.

There is no window between chunks, because nothing commits until the purge is complete. The cost is that a root whose purge exceeds the timeout rolls back as a whole, is counted as failed, and is retried on the next run. A purge of a very large root therefore needs a revisit of this decision, not a silent partial result.

Rejected: a root lock taken per batch. A restore could commit between two batches and return a folder that had already lost the children deleted by the earlier batches. Row locks taken per batch. They do not stop a restore of the folder itself. The subtree read before a batch can go stale.

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
