# @offgrid/family

Purpose: the reference module. It creates families and lists the families a user belongs to. Every later module copies this layout.
Public API: only what `src/index.ts` exports (`familyModule`, `FamilyModuleContext`, `listMyFamilies`); never import from `src/` internals. `listMyFamilies` is read by the server middleware to check a caller's current families on each request ([request context](../../.claude/rules/modules.md)).
Owner: module team (family)

## Schema and role

- Schema `family`, owned by the migration role `offgrid_migrator`. The runtime role `offgrid_app` has DML on its tables (ADR 0017).
- Data access uses a Prisma client for this module, created by `createModuleDb` and logged in as `offgrid_app` ([ADR 0017](../../docs/adr/0017-shared-database-roles-and-prisma-migrate.md)). Each request runs in a Prisma transaction that sets the request context with `withUserContext` or `withFamilyContext`. The outbox write uses `rawSqlExecutor` in the same transaction.
- `family.family` (scope `family`): one row per family, keyed by `family_id`.
- `family.family_member` (scope `family`): membership. The creator is the first member; invitations are out of scope.
- Read policies (in the `family_init` migration): a user sees their own `family_member` rows, and the `family` rows of families they belong to. `GET /families` relies on these, so it needs no projection.

Migrations for every module live in [packages/db/prisma/migrations](../../packages/db/prisma/migrations): the `family` folder is `*_family_init`.

## HTTP (under `/api`)

- `POST /families`: body `{ name }`, trimmed, 1 to 100 characters. Returns 201 with the family.
- `GET /families/:id`: 200 for a member. Non-members get 404 `NOT_FOUND`, the same as for a family that does not exist, so the response does not reveal which families exist. Membership is checked under the caller's user context before the family context is set.
- `GET /families`: the caller's families, read through the membership policies (no projection).

Errors use the shared codes from [packages/http](../../packages/http/README.md): `UNAUTHENTICATED`, `VALIDATION_FAILED`, `NOT_FOUND`, `ACCESS_DENIED`.

## Published events

- `family-created-v1` (version 1): `{ name, creatorUserId }`, owned by the family. Defined in [packages/contracts/src/family-created-v1.ts](../../packages/contracts/src/family-created-v1.ts). Written to the outbox in the same transaction as the family row.

## Layout

Each file holds one function, named after it in kebab-case ([function rules](../../.claude/rules/functions.md)). Types live in `src/types.ts` ([type rules](../../.claude/rules/types.md)).

```
src/types.ts                       all types of the module
src/family-module.ts               the module descriptor
src/index.ts                       re-exports only
src/domain/                        placeholder; the family has no domain rule yet
src/application/                   create-family, get-family, list-my-families
src/infrastructure/                one file per SQL query and transaction helper
src/events/                        publish-family-created
src/http/                          one register-* file per route; register-family-routes wires them
src/workers/                       placeholder; background jobs go here
test/start-family-test-database.ts Testcontainers Postgres with the init scripts and the shared migrations
```

Name validation lives in `packages/contracts` (`familyNameSchema`), so the route and the event payload share one rule.

## Copying this for a new module

1. Copy `modules/family` to `modules/<name>` and rename the package in `package.json`.
2. Write the module's migrations as a new folder in `packages/db/prisma/migrations` and replace the schema name in them, the `"family"` strings in `with-family-transaction.ts`, `set-*-context.ts` and `family-module.ts`.
3. Declare each table's ownership scope with `offgrid_declare_scope` ([packages/db README](../../packages/db/README.md)).
4. Add the module to `MODULES` in `apps/main-server/src/constants.ts` and the workspace dependency in `apps/main-server/package.json`.
5. Keep the tests: real Postgres for the store, isolation, events and routes.
