// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { findTargetPath } from "../files/find-target-path.js";
import type { FileRecord } from "../../types.js";

export const findRestorableParentId = async (
  tx: ModuleTransaction,
  file: FileRecord,
): Promise<string | null> => {
  const path = await findTargetPath(tx, file.driveId, file.parentId);
  return path === null ? null : file.parentId;
};
