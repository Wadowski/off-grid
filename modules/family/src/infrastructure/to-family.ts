// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Family, FamilyRecord } from "../types.js";

export const toFamily = (record: FamilyRecord): Family => ({
  id: record.familyId,
  name: record.name,
  createdAt: record.createdAt.toISOString(),
});
