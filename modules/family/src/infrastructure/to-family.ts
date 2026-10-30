// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Family, FamilyRow } from "../types.js";

export const toFamily = (row: FamilyRow): Family => ({
  id: row.family_id,
  name: row.name,
  createdAt: row.created_at.toISOString(),
});
