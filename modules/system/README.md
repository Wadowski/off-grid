# @offgrid/system

Purpose: facts about the running server installation. Today it reports the running version, so that an admin can compare it with the latest release.

Public API: `createSystemModule(options)` from `src/index.ts`. The options are the server's version settings, `{ version, commit? }`, read from `OFFGRID_VERSION` and `OFFGRID_COMMIT` by the server's config.

HTTP routes under `/api/system`:

- `GET /api/system/version` answers `{ version, commit? }`. It needs no sign-in, carries no personal data and makes no outbound call.

Owned tables: none. The module has no Postgres schema yet; update status and the update settings will add one (OG-170).

Imports: `@offgrid/contracts` only.

Owner: module team (system)
