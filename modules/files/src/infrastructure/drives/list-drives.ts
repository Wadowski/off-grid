// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { DriveRecord } from "../../types.js";
import { toDriveRecord } from "./to-drive-record.js";

export const listDrives = async (tx: ModuleTransaction): Promise<DriveRecord[]> => {
  const rows = await tx.filesDrive.findMany({
    orderBy: [
      { familyId: { sort: "asc", nulls: "first" } },
      { createdAt: "asc" },
      { driveId: "asc" },
    ],
  });
  return rows.map(toDriveRecord);
};
