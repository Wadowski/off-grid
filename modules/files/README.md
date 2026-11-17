# @offgrid/files

Purpose: file storage and metadata.
Public API: only what `src/index.ts` exports; never import from `src/` internals.
Owner: module team (files)

## Contracts

- Will serve the routes in `filesRoutes` from `@offgrid/contracts`: drives, folders, files, trash, versions, downloads and resumable uploads. Path parameters and bodies are validated with the contracts schemas.
- Will publish `drive-created-v1`, `file-created-v1`, `file-updated-v1` and `file-removed-v1` with the payloads defined in `@offgrid/contracts`. The payloads carry ids, owners and versions. Created and updated events also carry the name. No event carries file contents, storage keys, paths or checksums ([ADR 0033](../../docs/adr/0033-file-bytes-on-a-disk-volume.md), [ADR 0034](../../docs/adr/0034-files-access-model-trash-and-versions.md)).
- The outbox writes, projection consumers, and replay, idempotency and dead-letter tests belong to the issues that publish and consume these events; this package ships only the contract and its payload tests.
