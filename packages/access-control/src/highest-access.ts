// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Subject, Resource, AccessType } from "./types.js";
import { ownerAccess } from "./owner-access.js";
import { grantedAccesses } from "./granted-accesses.js";
import { rankOf } from "./rank-of.js";

export const highestAccess = (subject: Subject, resource: Resource): AccessType | undefined => {
  const candidates = [ownerAccess(subject, resource), ...grantedAccesses(subject, resource)];
  let highest: AccessType | undefined;
  for (const access of candidates) {
    if (access !== undefined && (highest === undefined || rankOf(access) > rankOf(highest))) {
      highest = access;
    }
  }
  return highest;
};
