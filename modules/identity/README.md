# @offgrid/identity

Purpose: user accounts, credentials, sessions, recovery codes and instance settings. This record is the foundation; sign-in, registration and account HTTP endpoints come in later issues of the user and auth milestone.
Public API: only what `src/index.ts` exports; never import from `src/` internals.
Owner: module team (identity)

## Schema and role

- Schema `identity`, owned by the migration role `offgrid_migrator`. The runtime role `offgrid_app` has DML on its tables ([ADR 0017](../../docs/adr/0017-shared-database-roles-and-prisma-migrate.md)).
- Data access uses the shared Prisma client, created by `createModuleDb`. Each write runs in a transaction that sets the request context with `withUserContext` first. The outbox write uses `rawSqlExecutor` in the same transaction.
- Migration: `packages/db/prisma/migrations/*_identity_init`.

## Tables

- `identity.user_account` (scope `user`, keyed by `user_id`): email, display name, instance role (`admin` or `user`) and status (`active` or `disabled`). Email is unique ignoring case. A user sees only their own row.
- `identity.credential` (scope `user`): one password hash per user. The database refuses anything that is not an argon2id hash, so a plain-text password cannot be stored.
- `identity.session` (scope `user`): device label, created, last used, expiry, a revoked flag and the SHA-256 digest of the refresh token (`refresh_token_hash`, unique). Added by migration `20261102000000_identity_session_refresh_token`.
- `identity.recovery_code` (scope `user`): hashed single-use codes. Each user has at most one active code, enforced by a partial unique index. Rotation retires the old code.
- `identity.password_reset` (scope `user`): hashed one-time reset codes issued by an admin or the host command. A code expires after 24 hours, is used once, and starting a new reset retires the previous one.
- `identity.instance_settings` (scope `instance`): one row, seeded with registration open. It has no owner column and any role can read it.

`identity.first_admin_claim` (scope `instance`): one row keyed by a constant. Creating the first account inserts it in the same transaction, so two simultaneous first sign-ups cannot both become admin; the second waits on the row and fails.

`identity.user_count()` is a `SECURITY DEFINER` function that returns only the number of accounts. It is the one deliberate read across rows: RLS hides other users' rows, so the first-user check needs the count. It is granted to the shared runtime role, so it must not be exposed on unauthenticated responses, where it would reveal the instance size.

Sign-in and refresh look up one row before anyone is signed in. They do this with read-only RLS policies (`user_account_sign_in_lookup`, `credential_sign_in_lookup`, `session_refresh_lookup`). Each policy matches a value the transaction sets with `set_config` (`app.sign_in_email`, `app.refresh_token_hash`), so the lookups are ordinary Prisma queries and no other row becomes visible.

The server middleware checks a bearer access token with `verifyAccessToken`. It uses the read-only policy `session_access_lookup` (migration `20261102000200_identity_access_token_lookup`), keyed on `app.access_token_hash`. The session must not be revoked or expired, and the account must be active. The function returns the user id and session id, or `null`.

Admin access uses `identity.is_active_admin()`, a `SECURITY DEFINER` function that returns true only when the request's user is an active admin. Admin policies on `user_account`, `session` and `password_reset` build on it (migration `20261102000300_identity_admin`). `identity.active_admin_count()` returns only a number, for the host recovery command.

## Administration

Every admin endpoint is under `/api/admin` and needs a signed-in active admin. A regular user gets `403 ACCESS_DENIED`, and an unauthenticated request gets `401`.

- `GET /api/admin/users`: every account with its role, status and creation time.
- `POST /api/admin/users/:userId/disable` and `.../enable`: disabling ends the account's sessions at once and refuses its sign-in. The last active admin cannot be disabled (`409 LAST_ADMIN`). Changes take a lock on the instance settings row, so two admins cannot disable each other at the same time.
- `POST /api/admin/users/:userId/password-reset`: issues a one-time code (`201`, `{ userId, code, expiresAt }`). The code is returned once and never logged. The admin hands it to the person in person.
- `GET` and `PATCH /api/admin/instance-settings`: read and change `registrationOpen`. Closing registration refuses new sign-ups with `REGISTRATION_CLOSED`.
- `POST /api/auth/password-reset` (public, rate limited): `{ code, password }` sets the new password with the code. The code works once. The password must pass the same rules as registration, and a rejected password keeps the code usable. Success revokes every session of the account and returns `204`. An unknown, used, retired, expired or disabled code gets `400 INVALID_RESET_CODE`.

Every admin action writes one structured log record with the action, the acting user and the target user. The records never contain a password, code or token.

### Host recovery command

`apps/main-server/src/recover-admin.ts` runs on the server host as the runtime database role, so it needs no extra secret. `reset-password --email` issues a reset code for an existing admin. `create-admin --email --name` creates an admin when no active admin exists, and it publishes `user-created-v1` like registration does. The README shows how to run both through Docker Compose.

## Domain rules

Pure code in `src/domain/`, with no I/O:

- A valid email address, at most 254 characters (`emailSchema`).
- A display name of 1 to 100 characters, shared with the contract in `packages/contracts`.
- Password rules (`findPasswordProblems`): 12 to 128 characters after Unicode NFKC normalisation, not on the bundled list of very common passwords, and not containing the email local part or display name (fragments under 3 characters are ignored). Each failed rule is a `PASSWORD_*` code.
- The first account on an instance is an admin; every later account is a regular user (`initialInstanceRole`).
- An instance always keeps one active admin: `canDisableAccount` refuses to disable the last one.
- While registration is closed, a later account is refused with `RegistrationClosedError`. The first account is always allowed.

## Registration

`POST /api/auth/register` creates an account (OG-47). It runs the password rules, hashes the password with Argon2id (`@node-rs/argon2`, OWASP minimum parameters), creates the user through `createUser` and then issues a session:

- The recovery code is 128 random bits, returned once in the `201` body. Only its SHA-256 digest is stored.
- The refresh token is 256 random bits, sent in the `offgrid_refresh` cookie (`HttpOnly`, `SameSite=Strict`, path `/api/auth`, `Secure` over HTTPS). Only its digest is stored. The session lasts 12 hours.
- Sign-up is limited to 5 requests per minute per client address on the route.
- Errors: `VALIDATION_FAILED` (400), the first failing `PASSWORD_*` code (400), `EMAIL_TAKEN` (409, email unique ignoring case), `REGISTRATION_CONFLICT` (409, two first sign-ups raced), `REGISTRATION_CLOSED` (403).

`GET /api/auth/registration-status` returns `{ freshServer, registrationOpen }` without authentication. It reveals only whether the instance has any account.

The two concurrent first sign-ups are covered by `register-account.integration.test.ts`. The second one can either become a regular user (when it starts after the first commits) or fail with `REGISTRATION_CONFLICT` (when it reaches the claim while the first is open). Exactly one account is admin in both cases.

## Published events

- `user-created-v1` (version 1): `{ userId, displayName }`, owned by the new user. Defined in [packages/contracts/src/user-created-v1.ts](../../packages/contracts/src/user-created-v1.ts). Written to the outbox in the same transaction as the account. The email address is never in the payload.

## Layout

Each file holds one function, named after it in kebab-case ([function rules](../../.claude/rules/functions.md)). Types live in `src/types.ts`, and constants in `src/constants.ts` ([type rules](../../.claude/rules/types.md)).

```
src/types.ts                 all types of the module
src/constants.ts             module constants
src/domain/                  pure rules: email, display name, password, first admin, last admin
src/application/             create-user, register-account, issue-session, rotate-recovery-code
src/infrastructure/          one file per table operation, plus hashing and tokens
src/http/                    registration routes and the refresh cookie
src/events/                  publish-user-created
src/index.ts                 public entry point (exports identityModule)
test/                        Testcontainers Postgres helper, with the shared migrations
```

## Not in this record

- Access tokens and the refresh endpoint. Sign-in, refresh and sign-out belong to the sign-in issue, which reads `refresh_token_hash`.
- Sign-in-side rate limits and per-account lockout (ADR 0016).
- Per-module database roles. ADR 0017 removed them, so the OG-46 criterion that a module role reaches only its own schema no longer applies.
- Admin screens (separate issue), roles inside a family, deleting accounts, and an audit log UI. Admin actions are logged, not stored.
