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
- `identity.session` (scope `user`): device label, created, last used, expiry and a revoked flag.
- `identity.recovery_code` (scope `user`): hashed single-use codes. Each user has at most one active code, enforced by a partial unique index. Rotation retires the old code.
- `identity.instance_settings` (scope `instance`): one row, seeded with registration open. It has no owner column and any role can read it.

`identity.user_count()` is a `SECURITY DEFINER` function, so the first-user check can count every account, though a user only sees their own row.

## Domain rules

Pure code in `src/domain/`, with no I/O:

- A valid email address, at most 254 characters (`emailSchema`).
- A display name of 1 to 100 characters, shared with the contract in `packages/contracts`.
- The first account on an instance is an admin; every later account is a regular user (`initialInstanceRole`).
- An instance always keeps one active admin: `canDisableAccount` refuses to disable the last one.

## Published events

- `user-created-v1` (version 1): `{ userId, displayName }`, owned by the new user. Defined in [packages/contracts/src/user-created-v1.ts](../../packages/contracts/src/user-created-v1.ts). Written to the outbox in the same transaction as the account. The email address is never in the payload.

## Layout

Each file holds one function, named after it in kebab-case ([function rules](../../.claude/rules/functions.md)). Types live in `src/types.ts`, and constants in `src/constants.ts` ([type rules](../../.claude/rules/types.md)).

```
src/types.ts                 all types of the module
src/constants.ts             module constants
src/domain/                  pure rules: email, display name, first admin, last admin
src/application/             create-user, rotate-recovery-code
src/infrastructure/          one file per table operation, plus to-user
src/events/                  publish-user-created
src/index.ts                 public entry point (nothing exported yet)
test/                        Testcontainers Postgres helper, with the shared migrations
```

## Not in this record

- Argon2id hashing and the recovery-code hash function. The application takes already-hashed values.
- The first-admin race. Two sign-ups at the same moment could both count zero users. ADR 0016 requires an atomic claim, which belongs to the registration issue (OG-47).
- Per-module database roles. ADR 0017 removed them, so the OG-46 criterion that a module role reaches only its own schema no longer applies.
