// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Subject, Resource, AccessType } from "./types.js";
import { isMemberOf } from "./is-member-of.js";

export const grantedAccesses = (subject: Subject, resource: Resource): AccessType[] => {
  return resource.grants
    .filter((grant) => isMemberOf(subject, grant.group.id))
    .map((grant) => grant.access);
};
