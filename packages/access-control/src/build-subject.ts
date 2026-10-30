// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Subject } from "./types.js";
import { buildUserGroup } from "./build-user-group.js";

export const buildSubject = (overrides: Partial<Subject> = {}): Subject => {
  return {
    userId: "user-a",
    groups: [buildUserGroup("user-a")],
    ...overrides,
  };
};
