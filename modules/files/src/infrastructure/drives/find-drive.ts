// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { DriveRecord } from "../../types.js";
import { toDriveRecord } from "./to-drive-record.js";

export const findDrive = async (
  tx: ModuleTransaction,
  driveId: string,
): Promise<DriveRecord | null> => {
  const row = await tx.filesDrive.findUnique({ where: { driveId } });
  return row === null ? null : toDriveRecord(row);
};
