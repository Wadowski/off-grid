# 0037. Cross-owner moves copy the subtree and remove the source, with an entry limit

- **Status:** Accepted

## Context

[0034](0034-files-access-model-trash-and-versions.md) section 8 allows a move to a drive with a different owner, as a copy with a notice. It leaves open how the copy is made, which versions it takes, how the source is removed, and what happens when the tree is large or the copy fails. [OG-113](https://linear.app/offgridos/issue/OG-113) implements the move, so these points must be settled.

Drive changes cannot be made by an UPDATE, because the composite foreign keys tie each file to its drive's owner. A row can only change owner by a new row.

## Decision

- A move to a drive of another owner inserts new file rows in the target drive. The new rows have new ids, version 1, and the same names, parents and folder structure as the source subtree. The response is the new root entry, with `crossOwnerNotice: true`. A move inside one drive keeps the row and sets the notice to false.
- Only the current version of each regular file is copied. Its bytes are copied to new storage keys before the database transaction, through the storage port. The copy has no reference to the source versions or keys. Older versions of the source stay with the source, and are removed with it.
- The source subtree is removed with a hard removal in the same transaction as the insert. Every entry of the subtree, folders and descendants included, gets one `file-removed-v1` event, because descendants are rows with their own ids that consumers may hold. Each copied entry gets one `file-created-v1` event in the target drive. The removal is hard, not trash: trash depends on [OG-117](https://linear.app/offgridos/issue/OG-117), and the source audience must not keep access to a copy that the owner moved.
- The order is: read the source and the target under the caller's row-level access and check the name in the target folder; copy the bytes; in one transaction, check that the source subtree is unchanged since the read, insert the copies, publish the created events, delete the source rows, and publish the removed events; after the commit, delete the source bytes. When the copy or the transaction fails, the copied keys are deleted on a best-effort basis, and the storage integrity sweep is the backstop for keys that could not be deleted.
- A subtree larger than the entry limit, or deeper than the ancestor depth limit, is refused with 409 `INVALID_MOVE` before any byte is copied. The limit is a constant in `modules/files/src/constants.ts`. There is no quota or size limit on the bytes copied in this change.
- A target that the caller cannot see is 404, checked first, as in [0034](0034-files-access-model-trash-and-versions.md).

We chose this because it keeps the two histories and audiences separate and gives each change one event. Rejected alternatives: refusing cross-owner moves, which forces a manual download and upload; moving the rows by changing the owner, which the foreign keys do not allow and which would silently change the readers; copying every version, which costs storage the owner did not ask for; soft removal, which waits on trash.

## Consequences

- Easier: a folder with its subfolders and files can move to a family drive in one request, and each consumer sees one created or removed event per entry.
- Harder: a move copies bytes, so it takes time in proportion to the size of the files. A crash between the copy and the cleanup leaves orphaned keys until the storage integrity sweep removes them. A source deleted after the commit whose bytes could not be removed also leaves orphans for the sweep.
- Known limits: no quota, no timeout on the copy, and the entry limit is a fixed number chosen for a home server, not a measured bound.
- Reversing this decision means a new ADR. The events already published stay valid, since they are released contracts.
