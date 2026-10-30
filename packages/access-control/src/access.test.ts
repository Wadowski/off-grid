// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { can } from "./can.js";
import { highestAccess } from "./highest-access.js";
import { visibleTo } from "./visible-to.js";
import { buildFamilyGroup } from "./build-family-group.js";
import { buildResource } from "./build-resource.js";
import { buildSubject } from "./build-subject.js";
import { buildUserGroup } from "./build-user-group.js";
import type { AccessType, Action } from "./types.js";

const familyA = buildFamilyGroup("family-a");
const familyB = buildFamilyGroup("family-b");
const alice = buildSubject({
  userId: "alice",
  groups: [buildUserGroup("alice"), familyA],
});
const bob = buildSubject({
  userId: "bob",
  groups: [buildUserGroup("bob"), familyA],
});
const outsider = buildSubject({
  userId: "carol",
  groups: [buildUserGroup("carol"), familyB],
});

describe("highestAccess", () => {
  const cases: Array<{
    name: string;
    subject: typeof alice;
    resource: ReturnType<typeof buildResource>;
    expected: AccessType | undefined;
  }> = [
    {
      name: "owner group member has manage",
      subject: alice,
      resource: buildResource({ owner: buildUserGroup("alice") }),
      expected: "manage",
    },
    {
      name: "family-shared resource gives family members manage",
      subject: bob,
      resource: buildResource({ owner: familyA }),
      expected: "manage",
    },
    {
      name: "explicit view grant to a group the subject is in",
      subject: bob,
      resource: buildResource({
        owner: buildUserGroup("alice"),
        grants: [{ group: familyA, access: "view" }],
      }),
      expected: "view",
    },
    {
      name: "highest of several grants wins",
      subject: alice,
      resource: buildResource({
        owner: buildUserGroup("someone-else"),
        grants: [
          { group: buildUserGroup("alice"), access: "view" },
          { group: familyA, access: "edit" },
        ],
      }),
      expected: "edit",
    },
    {
      name: "no access when neither owner nor granted",
      subject: outsider,
      resource: buildResource({
        owner: buildUserGroup("alice"),
        grants: [{ group: familyA, access: "manage" }],
      }),
      expected: undefined,
    },
    {
      name: "another family's resource is always denied",
      subject: outsider,
      resource: buildResource({ owner: familyA }),
      expected: undefined,
    },
  ];

  it.each(cases)("$name", ({ subject, resource, expected }) => {
    expect(highestAccess(subject, resource)).toBe(expected);
  });
});

describe("can", () => {
  const sharedWithFamilyAsView = buildResource({
    owner: buildUserGroup("alice"),
    grants: [{ group: familyA, access: "view" }],
  });
  const sharedWithFamilyAsEdit = buildResource({
    owner: buildUserGroup("alice"),
    grants: [{ group: familyA, access: "edit" }],
  });
  const ownedByAlice = buildResource({ owner: buildUserGroup("alice") });

  const cases: Array<{
    name: string;
    subject: typeof alice;
    action: Action;
    resource: ReturnType<typeof buildResource>;
    expected: boolean;
  }> = [
    {
      name: "owner can view",
      subject: alice,
      action: "view",
      resource: ownedByAlice,
      expected: true,
    },
    {
      name: "owner can edit",
      subject: alice,
      action: "edit",
      resource: ownedByAlice,
      expected: true,
    },
    {
      name: "owner can manage",
      subject: alice,
      action: "manage",
      resource: ownedByAlice,
      expected: true,
    },
    {
      name: "view grant allows view",
      subject: bob,
      action: "view",
      resource: sharedWithFamilyAsView,
      expected: true,
    },
    {
      name: "view grant denies edit",
      subject: bob,
      action: "edit",
      resource: sharedWithFamilyAsView,
      expected: false,
    },
    {
      name: "view grant denies manage",
      subject: bob,
      action: "manage",
      resource: sharedWithFamilyAsView,
      expected: false,
    },
    {
      name: "edit grant implies view",
      subject: bob,
      action: "view",
      resource: sharedWithFamilyAsEdit,
      expected: true,
    },
    {
      name: "edit grant allows edit",
      subject: bob,
      action: "edit",
      resource: sharedWithFamilyAsEdit,
      expected: true,
    },
    {
      name: "edit grant denies manage",
      subject: bob,
      action: "manage",
      resource: sharedWithFamilyAsEdit,
      expected: false,
    },
    {
      name: "no grant denies view",
      subject: outsider,
      action: "view",
      resource: ownedByAlice,
      expected: false,
    },
    {
      name: "no grant denies edit",
      subject: outsider,
      action: "edit",
      resource: ownedByAlice,
      expected: false,
    },
    {
      name: "another family's resource is always denied",
      subject: outsider,
      action: "view",
      resource: buildResource({ owner: familyA, grants: [{ group: familyA, access: "manage" }] }),
      expected: false,
    },
    {
      name: "unknown action is denied by default",
      subject: alice,
      action: "delete" as Action,
      resource: ownedByAlice,
      expected: false,
    },
  ];

  it.each(cases)("$name", ({ subject, action, resource, expected }) => {
    expect(can(subject, action, resource)).toBe(expected);
  });
});

describe("visibleTo", () => {
  it("lists the subject's group ids for repositories to filter on", () => {
    expect(visibleTo(bob)).toEqual({ groupIds: ["bob", "family-a"] });
  });

  it("returns no groups for a subject without memberships", () => {
    expect(visibleTo({ userId: "ghost", groups: [] })).toEqual({ groupIds: [] });
  });
});
