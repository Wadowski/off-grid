# @offgrid/files

Purpose: file storage and metadata. File bytes live on a disk volume behind a storage port, and the metadata lives in this module's Postgres schema ([ADR 0033](../../docs/adr/0033-file-bytes-on-a-disk-volume.md), [ADR 0034](../../docs/adr/0034-files-access-model-trash-and-versions.md)).
Public API: only what `src/index.ts` exports; never import from `src/` internals.
Owner: module team (files)

## Schema and role

- Schema `files`, runtime role `offgrid_app`, as for every module ([ADR 0009](../../docs/adr/0009-table-ownership-scopes.md)).
- Tables in schema `files` (migration `20261122000000_files_init`, Prisma models `FilesDrive`, `FilesFile`, `FilesFileVersion`), all scope `family-or-user` ([ADR 0034](../../docs/adr/0034-files-access-model-trash-and-versions.md)):
  - `drive`: one personal drive per user and one family drive per family (partial unique indexes). `kind` is `personal` or `family` and must match the owner. `name` is a stored copy (1 to 255 characters) that OG-111 sets; a later rename needs its own write path.
  - `file`: folders and regular files. A folder has no `mime_type`, `size_bytes` or `current_version_id`; a regular file has both `mime_type` and `size_bytes`. `size_bytes` is `bigint`. Trash is `deleted_at`. Names are unique per parent, case-insensitively, among live rows (`lower(name)`: no Unicode case folding or normalisation).
  - `file_version`: immutable for `offgrid_app` (`UPDATE` revoked; `INSERT` and `DELETE` allowed, the latter for purge). `storage_key` is opaque and never leaves the database or an event.
- Owner consistency is enforced by the database: `owner_id` on each table is generated from the owner columns, and composite foreign keys tie each file to its drive's owner, each version to its file's owner, and each parent folder to the same drive.
- `file.current_version_id` is a deferrable foreign key, so a file, its first version and the pointer commit in one transaction.
- Indexes: `file_children_idx (drive_id, parent_id, name)` for listing, `file_name_per_parent_idx` (unique, live rows only), `file_deleted_at_idx` (partial, trashed rows), `file_version_storage_key_idx`.
- Family membership policies (`files.family_membership`) and the family read path come with OG-110.

## Storage volume

- The server bind-mounts `data/files` at `/data/files` in Compose. The e2e stack mounts `data/files-e2e` instead.
- The server reads the directory from `OFFGRID_FILES_DIRECTORY` (default `/data/files`) and the upload cap from `OFFGRID_FILES_MAX_UPLOAD_BYTES` (default 50 GiB). See the [server configuration table](../../apps/main-server/README.md#configuration).
- Startup fails, naming the variable, when the directory is missing, is not a directory, or is not writable. `secrets-init` creates the Compose folders with owner 1000:1000 and mode 0700.
- Only this module reads or writes file bytes, through its storage port. The startup check in `apps/main-server/src/lifecycle/probe-directory-writable.ts` creates and removes a probe file in the folder to confirm it is writable. The storage port and disk adapter come with OG-109.
- Opaque storage keys, not user-chosen names, decide the paths on disk ([ADR 0033](../../docs/adr/0033-file-bytes-on-a-disk-volume.md)).

## Contracts

- Will serve the routes in `filesRoutes` from `@offgrid/contracts`: drives, folders, files, trash, versions, downloads and resumable uploads. Path parameters and bodies are validated with the contracts schemas.
- Will publish `drive-created-v1`, `file-created-v1`, `file-updated-v1` and `file-removed-v1` with the payloads defined in `@offgrid/contracts`. The payloads carry ids, owners and versions. Created and updated events also carry the name. No event carries file contents, storage keys, paths or checksums ([ADR 0033](../../docs/adr/0033-file-bytes-on-a-disk-volume.md), [ADR 0034](../../docs/adr/0034-files-access-model-trash-and-versions.md)).
- The outbox writes, projection consumers, and replay, idempotency and dead-letter tests belong to the issues that publish and consume these events; this package ships only the contract and its payload tests.
