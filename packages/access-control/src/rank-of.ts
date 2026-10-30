// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AccessType } from "./types.js";
import { ACCESS_RANK } from "./constants.js";

export const rankOf = (access: AccessType): number => {
  return ACCESS_RANK[access];
};
