// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { lockTrashedRoot } from "./lock-trashed-root.js";

export const lockTrashedRootsInOrder = async (
  tx: ModuleTransaction,
  fileIds: readonly string[],
): Promise<boolean> => {
  for (const fileId of fileIds) {
    if (!(await lockTrashedRoot(tx, fileId))) {
      return false;
    }
  }
  return true;
};
