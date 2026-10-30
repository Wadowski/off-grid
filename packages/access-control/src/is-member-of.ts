// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AccessGroup, Subject } from "./types.js";

export const isMemberOf = (subject: Subject, group: AccessGroup): boolean => {
  return subject.groups.some(
    (membership) => membership.id === group.id && membership.kind === group.kind,
  );
};
