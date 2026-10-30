# @offgrid/family

Purpose: the reference module. It creates families and lists the families a user belongs to. Every later module copies this layout.
Public API: only what `src/index.ts` exports (`familyModule`); never import from `src/` internals.
Owner: module team (family)

## Schema and role

- Schema `family`, owner role `family_owner` (runs the migrations), runtime role `family_app` (DML on its own schema only).
- `family.family` (scope `family`): one row per family, keyed by `family_id`.
- `family.family_member` (scope `family`): creator membership. Issue OG-37 has no invitations yet.
- `family.family_summary` (scope `user`): read-only projection of families for each user, with `source_version`. Written only by the family-summary subscriber.

Migrations live in [src/infrastructure/migrations](src/infrastructure/migrations).

## HTTP (under `/api`)

- `POST /families`: body `{ name }` (1 to 100 characters). Returns 201 with the family. The creator becomes its first member.
- `GET /families/:id`: 200 for a member, 403 `ACCESS_DENIED` otherwise, 404 when the family does not exist.
- `GET /families`: the caller's families, read from `family.family_summary`.

The caller comes from the request context (`x-offgrid-user-id` in dev identity). Without a user the routes return 401.

## Published events

- `family-created-v1` (version 1): `{ name, creatorUserId }`, owned by the family. Defined in [packages/contracts/src/family.ts](../../packages/contracts/src/family.ts). Written to the outbox in the same transaction as the family row.

## Consumed events

- `family-created-v1` by subscriber `family-summary`, running as `family_app`. It applies a version only when `classifySourceVersion` says so: a repeat is skipped, an older version is ignored, a gap fails the delivery and retries until it is dead-lettered.

## Layout

```
src/domain/          Family type and name rule, no I/O
src/application/     family-service: createFamily, getFamily, listMyFamilies
src/infrastructure/  SQL store, transaction helper, migrations
src/http/            Fastify routes and request validation
src/events/          publish helper and the family-summary projection
src/workers/         placeholder; background jobs go here
src/index.ts         the only public entry: familyModule
test/postgres.ts     Testcontainers Postgres with the init scripts, outbox and family migrations
```

## Copying this for a new module

1. Copy `modules/family` to `modules/<name>` and rename the package in `package.json`.
2. Replace the schema name in the migrations, the `family` string in `transaction.ts` and `family-store.ts`, and the module descriptor in `index.ts`.
3. Declare each table's ownership scope with `offgrid_declare_scope` ([packages/db README](../../packages/db/README.md)).
4. Add the module to `MODULES` in `apps/main-server/src/module-list.ts` and the workspace dependency in `apps/main-server/package.json`.
5. Keep the tests: real Postgres for the store, isolation, events and routes.
