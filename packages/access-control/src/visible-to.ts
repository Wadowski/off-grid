// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Subject, VisibilityFilter } from "./types.js";

export const visibleTo = (subject: Subject): VisibilityFilter => {
  return { groupIds: subject.groups.map((group) => group.id) };
};
