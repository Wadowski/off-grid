# 0039. Delete a non-current file version, and a restore copies the bytes

- **Status:** Accepted

## Context

[0034](0034-files-access-model-trash-and-versions.md) section 7 makes versions immutable and keeps them until their file is purged. It says that a restore creates a new version that "refers to the same bytes as the old one". [0037](0037-cross-owner-move-copy-and-removal.md) already copies bytes when a file changes owner. [OG-118](https://linear.app/offgridos/issue/OG-118) adds the version routes: upload a new version, list versions, restore an older version and delete a version. Two of these change the decision in 0034 section 7.

Sharing one storage key between two version rows means that deleting either version would delete bytes that the other still refers to. Sharing would need reference counting before a delete could be safe. The integrity sweep and purge are simpler when each storage key belongs to one version row.

## Decision

### 1. A non-current version can be deleted

A person can delete a version of a regular file when it is not the file's current version. The delete removes the version row, and after the database commit it removes the version's bytes. It publishes no event, because the file row, its `version` and its current pointer do not change. The current version cannot be deleted; the API answers 409 with the code `CURRENT_VERSION`.

Deleting a version is the only way to remove a version before its file is purged. This refines 0034 section 7, which said versions are deleted only at purge.

We chose this because people keep large drafts and want to free space without deleting the whole file. Rejected alternative: deleting a version by bumping `version` and publishing an update, since no consumer can see individual versions and the event would only repeat the same file state.

### 2. A restore copies the bytes to a new storage key

A restore of an older version copies its bytes to a new storage key, then creates a new version row that points at the copy and makes it current. The old version row is not changed. This refines 0034 section 7, which said the new version refers to the same bytes.

The copy costs disk space equal to the file. A restore streams the bytes from the old key into the new key, so memory use stays flat. Restoring the current version changes nothing and publishes no event.

We chose this because each storage key then belongs to one version row, so section 1 can delete bytes safely and the integrity sweep and purge keep working on one key per row. Rejected alternative: sharing the storage key, which saves disk but makes a delete of either version corrupt the other.

### 3. Consequences

- Disk use grows on restore. Versions are still uncapped until quotas exist ([0034](0034-files-access-model-trash-and-versions.md) section 7).
- A crash after a commit can leave orphan bytes. The integrity sweep reports them and nothing deletes them automatically, as for the other flows.
- Purge still deletes the bytes of every version of a purged file. Its code is not changed by this ADR.
- Rollback is safe: no migration and no event version change.
