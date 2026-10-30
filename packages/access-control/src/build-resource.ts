// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Resource } from "./types.js";
import { buildUserGroup } from "./build-user-group.js";

export const buildResource = (overrides: Partial<Resource> = {}): Resource => {
  return {
    owner: buildUserGroup("user-a"),
    grants: [],
    ...overrides,
  };
};
