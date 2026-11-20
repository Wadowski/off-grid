// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { publishFileRemoved } from "../../events/files/publish-file-removed.js";
import { deleteFileRows } from "../../infrastructure/files/delete-file-rows.js";
import { deleteFileVersions } from "../../infrastructure/files/delete-file-versions.js";
import type { CrossOwnerPlan } from "../../types.js";

export const removeSourceTree = async (
  tx: ModuleTransaction,
  plan: CrossOwnerPlan,
): Promise<void> => {
  const fileIds = plan.tree.entries.map((entry) => entry.fileId);
  await deleteFileVersions(tx, fileIds);
  await deleteFileRows(tx, fileIds);
  for (const entry of plan.tree.entries) {
    await publishFileRemoved(tx, { file: entry, owner: plan.sourceOwner });
  }
};
