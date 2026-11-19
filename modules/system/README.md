# @offgrid/system

Purpose: facts about the running server installation, and the admin's view of updates. It reports the running version, so that an admin can compare it with the latest release. It checks for a release, applies an update and holds the nightly automatic update setting ([ADR 0032](../../docs/adr/0032-outbound-update-check-and-image-pull.md)).

Public API: `createSystemModule(options)` from `src/index.ts`. The options are the server's version settings, `{ version, commit? }`, read from `OFFGRID_VERSION` and `OFFGRID_COMMIT`, and `updater`, which is `{ url, token }` or `null`. The server reads the updater settings from `OFFGRID_UPDATER_URL` and `OFFGRID_UPDATER_TOKEN_FILE`. The module reaches the context through `db`, `currentUserId` and `isInstanceAdmin`.

HTTP routes under `/api/system`:

- `GET /api/system/version` answers `{ version, commit? }`. It needs no sign-in, carries no personal data and makes no outbound call.
- `GET /api/system/update` (admin) answers the current version, the latest version from the last check (or `null`), `updateAvailable`, `updateAllowed`, `checkedAt`, `runState`, the last update run (or `null`), `running` and `nightlyEnabled`. It reads the stored check and the updater's `/status` on the internal network. It never calls the updater's `/check`, and it makes no call to GitHub.
- `POST /api/system/update/check` (admin) asks the updater to check for a release, stores the result and returns it. This is an admin action, one of the two outbound triggers in ADR 0032.
- `POST /api/system/update/apply` (admin) checks again through the updater, then asks it to apply the latest release. It answers `202 { started: true, targetVersion }`. It refuses with `409 NO_UPDATE_AVAILABLE` when no newer release exists, with `409 UPDATE_NOT_ALLOWED` when the running version is below `minimumPreviousVersion`, and with `409 UPDATE_ALREADY_RUNNING` while a run is active. The updater lock decides races.
- `PUT /api/system/update/nightly` (admin) takes `{ enabled: boolean }`, stores it and returns `{ enabled }`. The default is `false`. The updater runs the nightly check at a fixed hour, and reads the setting through the route below.
- `GET /api/system/updater/nightly` answers `{ enabled }` to the updater only. It is not a user route: it needs `Authorization: Bearer <updater token>`, compared in constant time with `matchesBearerToken` from `@offgrid/http`. A wrong or missing token gets `401 UNAUTHENTICATED`, and a server with no updater token configured gets `503 UPDATER_UNAVAILABLE`. A signed-in user session does not pass. The reply carries no personal data.

Errors use the body `{ code, message }` with fixed messages. A non-admin signed-in user gets `403 ACCESS_DENIED`, and an anonymous request gets `401`. Updater failures map to `503 UPDATER_UNAVAILABLE` (unreachable, timed out or not configured), `502 RELEASE_SOURCE_UNREACHABLE`, `409 CURRENT_VERSION_UNKNOWN` (a `dev` build) and `502 UPDATER_ERROR` (any other reply, including a reply that does not match its schema). No updater error text, URL or token reaches a response or a log. Every updater call has a 10 second timeout and sends the bearer token read from the token file.

Admin check: the module asks the server for `isInstanceAdmin(userId)`. It does not read identity tables. The server wires that function to `@offgrid/identity`.

Owned tables: schema `system`, table `update_settings`, with one row (`setting_key = 'instance'`, scope `instance`). It holds `nightly_enabled`, the latest checked version, `update_available`, `update_allowed` and `checked_at`. It has no owner column and no personal data. The migration `20261203000000_system_update_settings` creates the schema and the row.

Outbound calls: none from the server. The server calls only the updater, on the internal Compose network, with a bearer token. The updater calls `api.github.com`, `release-assets.githubusercontent.com`, `ghcr.io` and `pkg-containers.githubusercontent.com`, only for the two triggers in ADR 0032.

Trust trade-off: the server holds the updater token, so a compromised server can ask the updater to start an update. It cannot start containers or reach the Docker socket directly. The updater pulls only the release digests from the manifest, and the manifest is not signed (ADR 0032).

Imports: `@offgrid/contracts`, `@offgrid/db` and `@offgrid/http`.

Owner: module team (system)
