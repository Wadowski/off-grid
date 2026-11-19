// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DriveRecord } from "../../types.js";

export const toDrive = (record: DriveRecord) => ({
  id: record.driveId,
  familyId: record.familyId,
  name: record.name,
  createdAt: record.createdAt.toISOString(),
});
