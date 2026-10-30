// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AccessGroup, Resource, Subject } from "./types.js";

export function buildUserGroup(id: string): AccessGroup {
  return { id, kind: "user" };
}

export function buildFamilyGroup(id: string): AccessGroup {
  return { id, kind: "family" };
}

export function buildSubject(overrides: Partial<Subject> = {}): Subject {
  return {
    userId: "user-a",
    groups: [buildUserGroup("user-a")],
    ...overrides,
  };
}

export function buildResource(overrides: Partial<Resource> = {}): Resource {
  return {
    owner: buildUserGroup("user-a"),
    grants: [],
    ...overrides,
  };
}
