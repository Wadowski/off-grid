// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Subject } from "./types.js";

export const isMemberOf = (subject: Subject, groupId: string): boolean => {
  return subject.groups.some((group) => group.id === groupId);
};
