// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext, type ModuleTransaction } from "@offgrid/db";
import { PERSONAL_DRIVE_NAME } from "../../constants.js";
import { insertPersonalDrive } from "../../infrastructure/drives/insert-personal-drive.js";
import { publishDriveCreated } from "../../events/drives/publish-drive-created.js";

export const createPersonalDrive = async (tx: ModuleTransaction, userId: string): Promise<void> => {
  await withUserContext(tx, userId);
  const driveId = randomUUID();
  const createdCount = await insertPersonalDrive(tx, {
    driveId,
    userId,
    name: PERSONAL_DRIVE_NAME,
  });
  if (createdCount === 1) {
    await publishDriveCreated(tx, { driveId, ownerUserId: userId, ownerFamilyId: null });
  }
};
