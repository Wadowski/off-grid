// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Subject, Action, Resource } from "./types.js";
import { isKnownAction } from "./is-known-action.js";
import { highestAccess } from "./highest-access.js";
import { rankOf } from "./rank-of.js";

export const can = (subject: Subject, action: Action, resource: Resource): boolean => {
  if (!isKnownAction(action)) {
    return false;
  }
  const level = highestAccess(subject, resource);
  return level !== undefined && rankOf(level) >= rankOf(action);
};
