// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AccessGroup } from "./types.js";

export const buildFamilyGroup = (id: string): AccessGroup => {
  return { id, kind: "family" };
};
