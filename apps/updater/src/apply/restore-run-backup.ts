// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateRun } from "../types.js";

export const restoreRunBackup = async (run: UpdateRun): Promise<void> => {
  const { backupName } = run.status;
  if (backupName === null) {
    throw new Error("no backup was taken in this run");
  }
  await run.dependencies.backup.restore(backupName);
};
