// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DriveRecord } from "../../types.js";

export const toDriveRecord = (row: {
  driveId: string;
  userId: string | null;
  familyId: string | null;
  name: string;
  createdAt: Date;
}): DriveRecord => ({
  driveId: row.driveId,
  userId: row.userId,
  familyId: row.familyId,
  name: row.name,
  createdAt: row.createdAt,
});
