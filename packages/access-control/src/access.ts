// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AccessType, Action, Resource, Subject, VisibilityFilter } from "./types.js";

const ACCESS_RANK: Readonly<Record<AccessType, number>> = {
  view: 1,
  edit: 2,
  manage: 3,
};

const OWNER_ACCESS: AccessType = "manage";

function rankOf(access: AccessType): number {
  return ACCESS_RANK[access];
}

function isKnownAction(action: string): action is Action {
  return Object.hasOwn(ACCESS_RANK, action);
}

function isMemberOf(subject: Subject, groupId: string): boolean {
  return subject.groups.some((group) => group.id === groupId);
}

function ownerAccess(subject: Subject, resource: Resource): AccessType | undefined {
  return isMemberOf(subject, resource.owner.id) ? OWNER_ACCESS : undefined;
}

function grantedAccesses(subject: Subject, resource: Resource): AccessType[] {
  return resource.grants
    .filter((grant) => isMemberOf(subject, grant.group.id))
    .map((grant) => grant.access);
}

export function highestAccess(subject: Subject, resource: Resource): AccessType | undefined {
  const candidates = [ownerAccess(subject, resource), ...grantedAccesses(subject, resource)];
  let highest: AccessType | undefined;
  for (const access of candidates) {
    if (access !== undefined && (highest === undefined || rankOf(access) > rankOf(highest))) {
      highest = access;
    }
  }
  return highest;
}

export function can(subject: Subject, action: Action, resource: Resource): boolean {
  if (!isKnownAction(action)) {
    return false;
  }
  const level = highestAccess(subject, resource);
  return level !== undefined && rankOf(level) >= rankOf(action);
}

export function visibleTo(subject: Subject): VisibilityFilter {
  return { groupIds: subject.groups.map((group) => group.id) };
}
