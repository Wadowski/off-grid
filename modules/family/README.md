# @offgrid/family

Purpose: the reference module. It creates families and lists the families a user belongs to. Every later module copies this layout.
Public API: only what `src/index.ts` exports (`familyModule`, `FamilyModuleContext`, `listMyFamilies`); never import from `src/` internals. `listMyFamilies` is read by the server middleware to check a caller's current families on each request ([request context](../../.claude/rules/modules.md)).
Owner: module team (family)

## Schema and role

- Schema `family`, owned by the migration role `offgrid_migrator`. The runtime role `offgrid_app` has DML on its tables (ADR 0017).
- Data access uses a Prisma client for this module, created by `createModuleDb` and logged in as `offgrid_app` ([ADR 0017](../../docs/adr/0017-shared-database-roles-and-prisma-migrate.md)). Each request runs in a Prisma transaction that sets the request context with `withUserContext` or `withFamilyContext`. The outbox write uses `rawSqlExecutor` in the same transaction.
- `family.family` (scope `family`): one row per family, keyed by `family_id`.
- `family.family_member` (scope `family`): membership with a `role` of `admin` or `member` ([ADR 0021](../../docs/adr/0021-family-membership.md)). The creator is the first member and the first admin.
- `family.invitation` (scope `family`): one row per invitation, keyed by `invitation_id`. Only the SHA-256 hash of the code is stored (`code_hash`), and the code is shown once at creation. Admins of the family can read and write its rows. A joiner can read a row, and set `used_by`, `used_at` and `revoked_at` on it, only while presenting its code. Both policies are keyed on `app.invitation_code_hash`, as in [ADR 0021](../../docs/adr/0021-family-membership.md). The database role may update only those three columns. No `SECURITY DEFINER` function is used.
- `family.invitation_attempt` (scope `user`): failed redemption attempts per account, with `locked_until`, so the lockout is shared between instances ([ADR 0019](../../docs/adr/0019-state-shared-between-instances.md)).
- Read policies (in the `family_init` migration): a user sees their own `family_member` rows, and the `family` rows of families they belong to. `GET /families` relies on these, so it needs no projection.

Migrations for every module live in [packages/db/prisma/migrations](../../packages/db/prisma/migrations): the `family` folder is `*_family_init`.

## HTTP (under `/api`)

- `POST /families`: body `{ name }`, trimmed, 1 to 100 characters. Returns 201 with the family.
- `GET /families/:id`: 200 for a member. Non-members get 404 `NOT_FOUND`, the same as for a family that does not exist, so the response does not reveal which families exist. Membership is checked under the caller's user context before the family context is set.
- `GET /families`: the caller's families, read through the membership policies (no projection).
- `GET /families/:id/members`: the members with `userId`, `displayName` (or `null` until the name has been copied), `role` and `joinedAt`. Any member may read it. Non-members get 404 `NOT_FOUND`. Names come from `family.account_name` and are visible only to people who share a family with the person ([ADR 0023](../../docs/adr/0023-display-names-visible-to-family-members.md)).
- `PATCH /families/:id/members/:userId`: body `{ role }`, `admin` or `member`. Only an admin may change a role; a member gets 403 `ACCESS_DENIED`. Returns 200 with the member. Demoting the last admin returns 409 `LAST_ADMIN`.
- `DELETE /families/:id/members/:userId`: an admin removes a member and gets 204. A member gets 403 `ACCESS_DENIED`. Removing the last admin returns 409 `LAST_ADMIN`. A removed member loses access on their next request, because the request identity reads memberships from this module's table.
- `POST /families/:id/invitations`: an admin creates an invitation. Returns 201 with `{ invitationId, code, expiresAt }`. The code is 128 random bits and expires seven days later. A member gets 403 `ACCESS_DENIED`.
- `DELETE /families/:id/invitations/:invitationId`: an admin revokes an unused invitation and gets 204. An invitation that is used, revoked or unknown gets 404 `NOT_FOUND`.
- `POST /families/invitations/preview`: takes a code and returns 200 with `{ familyId, familyName, familyCreatedAt, invitedBy: { displayName } }` without using the code. The family row and the inviter's name are readable only while that live invitation exists ([ADR 0027](../../docs/adr/0027-invitation-preview.md)). Unknown, spent, revoked or already-joined codes get 404 `NOT_FOUND`, and a limited account gets 429.
- `POST /families/join`: body `{ code }`. A signed-in account redeems a code and joins as a `member`. Returns 201 with `{ familyId }`. A code that is unknown, used, revoked, expired, or belongs to a family the account already joined gets the same 404 `NOT_FOUND`, so codes cannot be probed. An account that gets 5 wrong answers in a row is locked for 15 minutes and gets 429 `RATE_LIMITED`, even with a valid code. A successful join clears the count.

Redemption is one transaction: the code row is found under the code policy, the conditional update that sets `used_at` decides whether the code is still usable, and the membership and the `family-member-added-v1` event are written only then. Two concurrent redemptions of one code cannot both succeed. An account that already belongs to the family gets the same 404, and that answer does not count toward the lockout.

Admin checks take a family-wide advisory lock first, so two concurrent changes cannot leave a family without an admin. The rule that keeps an admin lives in `src/domain/keeps-an-admin.ts`; the role check lives in `packages/access-control`.

Invitation codes never appear in logs or events.

Errors use the shared codes from [packages/http](../../packages/http/README.md): `UNAUTHENTICATED`, `VALIDATION_FAILED`, `NOT_FOUND`, `ACCESS_DENIED`.

## Published events

- `family-created-v1` (version 1): `{ name }`, owned by the family. Defined in [packages/contracts/src/family-created-v1.ts](../../packages/contracts/src/family-created-v1.ts). Written to the outbox in the same transaction as the family row.
- `family-member-updated-v1` (version 1): `{ userId, role }`, written when a role changes. Defined in [packages/contracts/src/family-member-updated-v1.ts](../../packages/contracts/src/family-member-updated-v1.ts).
- `family-member-removed-v1` (version 1): `{ userId }`, written when a member is removed. Defined in [packages/contracts/src/family-member-removed-v1.ts](../../packages/contracts/src/family-member-removed-v1.ts).
- `family-member-added-v1` (version 1): `{ userId, role }`, written when a member joins by invitation. Defined in [packages/contracts/src/family-member-added-v1.ts](../../packages/contracts/src/family-member-added-v1.ts).

Both membership events use `sourceVersion` 1 for now. No projection reads them yet. A projection that needs ordering must add a per-membership version first.

## Consumed events

- `user-created-v1` and `user-profile-updated-v1` (from identity): each one writes the person's name to `family.account_name`, with the source version. A change at or below the stored version is ignored. A change that skips a version fails so that the bus retries it. Handlers run in a transaction as the person the event names, so the row-level security rules hold. Subscribers are registered in [src/events/account-names](src/events/account-names).

## Layout

Each file holds one function, named after it in kebab-case ([function rules](../../.claude/rules/functions.md)). Types live in `src/types.ts` ([type rules](../../.claude/rules/types.md)).

```
src/types.ts                       all types of the module
src/family-module.ts               the module descriptor
src/index.ts                       re-exports only
src/domain/                        pure rules, e.g. keeps-an-admin
src/application/                   create-family, get-family, list-my-families, list-family-members, change-family-member-role, remove-family-member, require-family-admin; invitations/ holds create, revoke and redeem for invitations
src/domain/invitations/            lockout rules for redemption attempts
src/infrastructure/                one file per SQL query and transaction helper; invitations/ holds the invitation and attempt queries
src/events/                        publish-family-event and publish-family-created
src/http/                          one register-* file per route; invitations/ holds the invitation routes; register-family-routes wires them
src/workers/                       placeholder; background jobs go here
test/start-family-test-database.ts Testcontainers Postgres with the init scripts and the shared migrations
test/add-family-member.ts          seeds a member with a role for tests
```

Name validation lives in `packages/contracts` (`familyNameSchema`), so the route and the event payload share one rule.

## Copying this for a new module

1. Copy `modules/family` to `modules/<name>` and rename the package in `package.json`.
2. Write the module's migrations as a new folder in `packages/db/prisma/migrations` and replace the schema name in them, the `"family"` strings in `with-family-transaction.ts`, `set-*-context.ts` and `family-module.ts`.
3. Declare each table's ownership scope with `offgrid_declare_scope` ([packages/db README](../../packages/db/README.md)).
4. Add the module to `MODULES` in `apps/main-server/src/constants.ts` and the workspace dependency in `apps/main-server/package.json`.
5. Keep the tests: real Postgres for the store, isolation, events and routes.
