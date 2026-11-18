// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateRun } from "../types.js";
import { RunBackupMissingError } from "./errors/run-backup-missing-error.js";
import { patchRunStatus } from "./patch-run-status.js";

export const restoreRunBackup = async (run: UpdateRun): Promise<void> => {
  const { backupName } = run.status;
  if (backupName === null) {
    throw new RunBackupMissingError("rollback_restore");
  }
  await run.dependencies.backup.restore(backupName);
  await patchRunStatus(run, { writesAfterBackupLost: true });
};
