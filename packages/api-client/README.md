# @offgrid/api-client

Purpose: typed client for the server HTTP API.
Public API: only what `src/index.ts` exports; never import from `src/` internals.
Owner: platform team

## Exports

- `createApiClient({ baseUrl, fetch? })`: returns `request(method, path, body?)`. Sends `accept: application/json`, adds `content-type` only when there is a body, and returns the parsed JSON (or `undefined` for 204).
- `createFilesClient(client)`: typed methods for drives, folders, files, versions, trash and resumable uploads. Every JSON response is parsed with its contracts schema, so a mismatched response rejects. `downloadUrl(fileId, versionId?)` returns the route path for `<a href>` and native streaming; the caller adds the API base. `uploadChunk(uploadId, offset, bytes)` sends raw bytes with the `Upload-Offset` header.
- `ApiError`: thrown for non-2xx responses. It carries `status` and `code`, read from the standard `ErrorResponse` in `@offgrid/contracts`. A body that is not an `ErrorResponse` becomes code `UNEXPECTED_RESPONSE`.
- `components` and `paths` types, generated from `packages/contracts/openapi.json`.

## Generated types

`src/generated/schema.ts` is generated from `packages/contracts/openapi.json` by `pnpm gen:api` and committed. `pnpm test` fails if it is stale.
