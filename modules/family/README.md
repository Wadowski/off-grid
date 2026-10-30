# @offgrid/family

Purpose: the reference module. It creates families and lists the families a user belongs to. Every later module copies this layout.
Public API: only what `src/index.ts` exports (`familyModule`, `FamilyModuleContext`); never import from `src/` internals.
Owner: module team (family)

## Schema and role

- Schema `family`, owner role `family_owner` (runs the migrations), runtime role `family_app` (DML on its own schema only).
- `family.family` (scope `family`): one row per family, keyed by `family_id`.
- `family.family_member` (scope `family`): membership. The creator is the first member; invitations are out of scope.
- `family.family_summary` (scope `user`): one row per (user, family) with the family name and `source_version`. It is a projection: no route writes it, only the `family-summary` subscriber does. `GET /families` reads it because the `family` rows are visible only inside one family's context, so a user's list across families needs a row keyed by the user.

Migrations live in [src/infrastructure/migrations](src/infrastructure/migrations).

## HTTP (under `/api`)

- `POST /families`: body `{ name }`, trimmed, 1 to 100 characters. Returns 201 with the family.
- `GET /families/:id`: 200 for a member, 403 `ACCESS_DENIED` for a family the caller cannot view, 404 `NOT_FOUND` when it does not exist.
- `GET /families`: the caller's families from `family.family_summary`.

Errors use the shared codes from [packages/http](../../packages/http/README.md): `UNAUTHENTICATED`, `VALIDATION_FAILED`, `NOT_FOUND`, `ACCESS_DENIED`.

## Published events

- `family-created-v1` (version 1): `{ name, creatorUserId }`, owned by the family. Defined in [packages/contracts/src/family.ts](../../packages/contracts/src/family.ts). Written to the outbox in the same transaction as the family row.

## Consumed events

- `family-created-v1` by subscriber `family-summary`, running as `family_app`. It applies a version only when `classifySourceVersion` says so: a repeat is skipped, an older version is ignored, a gap fails the delivery and retries until it is dead-lettered.

## Layout

Each file holds one function, named after it in kebab-case ([function rules](../../.claude/rules/functions.md)). Types live in `src/types.ts` ([type rules](../../.claude/rules/types.md)).

```
src/types.ts                       all types of the module
src/family-module.ts               the module descriptor
src/index.ts                       re-exports only
src/domain/                        placeholder; the family has no domain rule yet
src/application/                   create-family, get-family, list-my-families
src/infrastructure/                one file per SQL query, transaction helper, migrations
src/events/                        publish-family-created, project-family-created, the subscription
src/http/                          one register-* file per route, family-routes aggregates them
src/workers/                       placeholder; background jobs go here
test/postgres.ts                   Testcontainers Postgres with the init scripts, outbox and family migrations
```

Name validation lives in `packages/contracts` (`familyNameSchema`), so the route and the event payload share one rule.

## Copying this for a new module

1. Copy `modules/family` to `modules/<name>` and rename the package in `package.json`.
2. Replace the schema name in the migrations, the `"family"` strings in `with-family-transaction.ts`, `set-*-context.ts` and the descriptor in `family-module.ts`.
3. Declare each table's ownership scope with `offgrid_declare_scope` ([packages/db README](../../packages/db/README.md)).
4. Add the module to `MODULES` in `apps/main-server/src/module-list.ts` and the workspace dependency in `apps/main-server/package.json`.
5. Keep the tests: real Postgres for the store, isolation, events and routes.
