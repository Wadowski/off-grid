// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { publishFileUpdated } from "../../events/files/publish-file-updated.js";
import { updateFile } from "../../infrastructure/files/update-file.js";
import type { FileRecord, SameDrivePlan } from "../../types.js";
import { assertNameFree } from "./assert-name-free.js";

export const moveWithinDrive = async (
  tx: ModuleTransaction,
  plan: SameDrivePlan,
): Promise<FileRecord> => {
  await assertNameFree(tx, {
    driveId: plan.file.driveId,
    parentId: plan.parentId,
    name: plan.file.name,
    excludeFileId: plan.file.fileId,
  });
  const moved = await updateFile(tx, plan.file.fileId, {
    parentId: plan.parentId,
    updatedAt: new Date(),
  });
  await publishFileUpdated(tx, { file: moved, owner: plan.owner });
  return moved;
};
