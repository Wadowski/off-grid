# 0034. Files: family or user drives, row-level access, soft-delete trash and immutable versions

- **Status:** Proposed

## Context

The files module is new. It stores files in drives. A drive belongs either to one person or to one family. Calendar already solved the same access problem for events: rows are protected by row-level security (RLS), and the module keeps a local projection of family membership fed by events ([ADR 0009](0009-table-ownership-scopes.md), [ADR 0021](0021-family-membership.md), [ADR 0022](0022-active-family-per-session.md), [ADR 0029](0029-event-guest-access.md)). Cross-module reads go through read-only projections ([ADR 0013](0013-projections-for-other-modules-only.md)). Persisted access groups belong to the `access` module, which is not built yet ([ADR 0022](0022-active-family-per-session.md)), so the files module cannot depend on them.

Files need three things that calendar does not have: deleted items that a person can restore for a while, a tree of folders, and a history of file content. The schema issue and the API issue both depend on one model for these, so this ADR fixes the rules before either is written. It does not decide where file bytes are stored. That is a separate decision.

## Decision

### 1. A drive has one owner

A drive is owned by exactly one user (`user` owner) or by exactly one family (`family` owner). Its scope is `family-or-user` ([ADR 0009](0009-table-ownership-scopes.md)): the row holds exactly one of `user_id` or `family_id`. The owner group is the user id for a personal drive and the family id for a family drive, as in the request context ([ADR 0022](0022-active-family-per-session.md)).

We chose this because a file has one place where it lives, and the owner decides who may read it. Rejected alternative: a separate access-group table per drive. It would duplicate the membership model before the `access` module exists.

### 2. Access is enforced by RLS with a local membership projection

Every files table is protected by RLS. The policies read a local `files.family_membership` projection. The projection is fed by `family-member-added-v1` and `family-member-removed-v1`, using the same subscription, `halt` policy, `sourceVersion` ordering and bounded removal delay as calendar. The files module does not read the `family` schema, and it does not call `packages/access-control` at runtime.

We chose this because the database enforces the rule on every query, including queries that a bug elsewhere would send. Rejected alternatives: reading the `family` schema directly, which ADR 0013 forbids; calling `packages/access-control` on each request, which is slower and repeats a check that RLS already makes.

### 3. Family drives are shared by all members

Every family member reads and writes every file in a family drive. This is this ADR's own decision for family drives. ADR 0021 gives members access to family-shared entities and does not narrow it. There is no per-file access list in this milestone. A person who is not a member, or who asks for a drive or file that is not visible to them, gets 404. The API never answers 403 for these cases, so it does not reveal that the item exists.

We chose this because it matches the family model and keeps the first version small. Rejected alternative: role-based write limits inside a family, which ADR 0021 does not provide.

### 4. Drives are created automatically

Each user gets one personal drive when the module handles `user-created-v1`. Each family gets one family drive when the module handles the family creation event (`family-created-v1`, the event in `packages/contracts`). Both inserts are idempotent. A drive is never deleted. Users cannot create extra drives in this milestone.

We chose this because a drive always exists when a person needs one, and the rule is simple to test. Rejected alternative: creating a drive on first use. That adds a write to a read path and a race between two first requests.

### 5. Folders are file rows

A folder is a row in `files.file` with `is_folder` set. It has a `parent_id`, which is null at the drive root. Folders have no versions. A name must be unique among the children of one parent in one drive. A create or a move that would repeat a name is refused with 409 and the code `NAME_TAKEN`, with a fixed message.

We chose one table for one tree, so that moves, listing and trash work the same way for files and folders. Rejected alternative: a separate folder table, which needs two tree walks and two sets of rules for the same operations.

### 6. Trash is a soft delete of a subtree root

Trashing a file or folder sets `deleted_at` on the root item only. Descendants are hidden because a reader checks the ancestor chain in the module's query code, using recursive Prisma queries, not a SQL function. The RLS policy protects rows by owner and membership only. We do not mark every descendant, because that costs one write per item and a partial restore could leave some items hidden. A trashed item can be restored until it is purged. Trashing and restoring publish no removed event in this ADR. The contracts issue (OG-107) decides which update events they publish.

Restoring an item clears its `deleted_at`. If the item sits under a trashed ancestor, only the selected item comes back. It moves out of the trashed ancestor to the drive root, and the ancestors stay in trash. Because only the root of a trashed subtree is marked, the restore also sets `deleted_at` on each remaining child of that ancestor, so those children stay in trash without the ancestor. A name that now collides with a sibling at the target gets an automatic numeric suffix, for example `report (2).pdf`. Auto-suffixing applies only to restore. Create and move refuse collisions instead (rule 5).

Purge hard-deletes the trashed subtree whose trash period has ended: the root, its descendants and their version rows. Each purged file publishes its own removed event. The default retention is 30 days. The value is set by `OFFGRID_FILES_TRASH_RETENTION_DAYS`, and it is read at startup. A daily purge worker in `src/workers/` runs the purge. Each purged file publishes its removed event with `version + 1`, in the same transaction as the delete ([ADR 0028](0028-calendar-event-time-and-versions.md)).

We chose a soft delete with a fixed window, so a person can undo a mistake without keeping data forever. Restores are rarer than trashes, so the extra writes belong to restore, not to trash. Rejected alternatives: hard delete only, which cannot be undone; a marker on every descendant, which costs one write per item and makes partial restores hard to get right.

### 7. Versions are immutable, and a pointer names the current one

A file version is a row in `files.file_version` that records a reference to stored bytes. Version rows are never updated, and no policy allows an update. The file row holds `current_version_id`, which points at the current version, and a `version` counter that is the `sourceVersion` of its events ([ADR 0028](0028-calendar-event-time-and-versions.md)).

Uploading new content creates a version and moves the pointer. Restoring an older version creates a new version that refers to the same bytes as the old one, and then moves the pointer. History is never rewritten. This ADR says only that a version refers to bytes. Where the bytes live is decided in the bytes ADR.

We keep every version, with no cap, in this milestone. Versions are deleted only when their file is purged. We will revisit this when quotas exist.

We chose immutable versions so that a restore is an ordinary write, and so that projections can order changes by `version`. Rejected alternative: overwriting the bytes in place, which loses the previous content and makes restore impossible.

### 8. Cross-owner moves are allowed with a notice

A move inside one drive keeps the same file row. A move to a drive with a different owner is allowed when the caller can see the target drive. If the target is not visible, the answer is 404 ([ADR 0029](0029-event-guest-access.md)). A move of a folder into its own subtree is refused.

A cross-owner move is treated as a new upload. The target gets a new file row and a first version whose bytes are copied to new storage. It has no reference to the source's versions or bytes. The source item is then removed. The response tells the caller that people with access to the source drive may have seen the file, and the client shows that notice to the caller.

We chose this because the owner of a file should be able to move it to a family or personal drive. A copy with no reference keeps the two histories and their audiences separate, and the notice makes the old audience visible. Rejected alternatives: refusing cross-owner moves, which forces a manual download and upload; moving the row and changing its owner, which silently changes its readers.

### 9. Events carry names, ids and versions; logs never carry names

File events (created, updated, removed) carry ids, `sourceVersion`, the drive id and the file or folder name, so that a receiving user sees the same name as the owner. They never carry file contents. Logs never carry file or folder names, and they never carry contents ([ADR 0011](0011-restricted-event-access-and-retention.md)). File names are personal data, so event consumers are restricted to the access rules above.

We chose this because a shared file must keep one name for every person who sees it. Rejected alternative: ids only, which forces each reader to look up the name in a separate read.

Event names and payloads are fixed in `packages/contracts` by the contracts issue.

## Consequences

- The files schema, the API and the events can follow one model. The schema names are `files.drive`, `files.file` (with `is_folder`, `parent_id`, `deleted_at`, `current_version_id` and `version`), `files.file_version` and `files.family_membership`.
- Access uses the same tested pattern as calendar, including the same best-effort delay between a removed membership and the loss of access. The delay is bounded in practice but not guaranteed ([ADR 0021](0021-family-membership.md)). A member who has been removed may keep access for up to that delay. The calendar module has the same gap.
- A purge needs a worker and a configuration value. The trash window is a privacy and storage trade-off that the operator controls.
- Versions are never capped, so storage grows with use until quotas exist. Quotas are not covered by this ADR.
- Sharing with people outside a family, public links and guests need a new ADR. This model does not allow them.
- A cross-owner move copies the bytes, so it uses storage equal to the file size until the source is purged. File names travel in events, so every event consumer holds personal data.
- Files written through a restore take a new version number. Projections order by `version`, so no projection needs to know whether a change was a restore.
- The bytes decision (where bytes live, how they are written and removed) is a separate ADR. Its outcome can change how a purge releases storage, but not the rules in this ADR.

Links: [ADR 0002](0002-outbox-events-and-projections.md), [ADR 0009](0009-table-ownership-scopes.md), [ADR 0011](0011-restricted-event-access-and-retention.md), [ADR 0013](0013-projections-for-other-modules-only.md), [ADR 0021](0021-family-membership.md), [ADR 0022](0022-active-family-per-session.md), [ADR 0028](0028-calendar-event-time-and-versions.md), [ADR 0029](0029-event-guest-access.md).
