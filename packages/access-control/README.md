# @offgrid/access-control

Purpose: family and access-group checks.
Public API: only what `src/index.ts` exports; never import from `src/` internals.
Owner: platform team

## Model

Every owned entity points to an owner access group. An access group is either a family or a single user, so the same check covers private and shared data.

- `AccessGroup`: `{ id, kind }`, where `kind` is `"family"` or `"user"`.
- `AccessType`: `view`, `edit` or `manage`. Higher levels imply lower ones.
- `Subject`: the user id and the groups that user belongs to.
- `Resource`: the owner group plus explicit `grants` to other groups.
- `Action`: the access level being asked for. It has the same values as `AccessType`.

The request context is supplied by the server middleware. This package never reads the request or the database.

## Functions

- `highestAccess(subject, resource)` returns the highest level the subject has, or `undefined`. Membership in the owner group gives `manage`. Otherwise the highest grant to a group the subject belongs to wins.
- `can(subject, action, resource)` is true when `highestAccess` meets or exceeds the action. It denies by default: an unknown action or a missing grant returns `false`.
- `visibleTo(subject)` returns `{ groupIds }`. A repository lists rows where the owner group or a grant group is one of these ids. Any membership gives at least `view`.

## Example

```ts
import {
  can,
  buildFamilyGroup,
  buildResource,
  buildSubject,
  buildUserGroup,
} from "@offgrid/access-control";

const family = buildFamilyGroup("family-1");
const bob = buildSubject({ userId: "bob", groups: [buildUserGroup("bob"), family] });
const shoppingList = buildResource({
  owner: buildUserGroup("alice"),
  grants: [{ group: family, access: "edit" }],
});

can(bob, "edit", shoppingList); // true: family grant
can(bob, "manage", shoppingList); // false: edit does not imply manage
```

## Guarantees

- No I/O, no imports from `apps/*`, `modules/*` or Prisma. Boundary rules enforce this.
- A resource owned by another family is always denied unless it is explicitly granted.
- Persistence of grants belongs to the `access` module, which comes later.
