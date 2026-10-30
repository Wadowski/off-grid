// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AccessType } from "./types.js";

export const ACCESS_RANK: Readonly<Record<AccessType, number>> = {
  view: 1,
  edit: 2,
  manage: 3,
};

export const OWNER_ACCESS: AccessType = "manage";
