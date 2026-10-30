// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Subject, Resource, AccessType } from "./types.js";
import { isMemberOf } from "./is-member-of.js";
import { OWNER_ACCESS } from "./constants.js";

export const ownerAccess = (subject: Subject, resource: Resource): AccessType | undefined => {
  return isMemberOf(subject, resource.owner) ? OWNER_ACCESS : undefined;
};
