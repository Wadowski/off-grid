// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withFamilyContext, type ModuleTransaction } from "@offgrid/db";
import { publishDriveCreated } from "../../events/drives/publish-drive-created.js";
import { insertFamilyDrive } from "../../infrastructure/drives/insert-family-drive.js";

export const createFamilyDrive = async (
  tx: ModuleTransaction,
  familyId: string,
  familyName: string,
): Promise<void> => {
  await withFamilyContext(tx, familyId);
  const driveId = randomUUID();
  const createdCount = await insertFamilyDrive(tx, { driveId, familyId, name: familyName });
  if (createdCount === 1) {
    await publishDriveCreated(tx, { driveId, ownerUserId: null, ownerFamilyId: familyId });
  }
};
