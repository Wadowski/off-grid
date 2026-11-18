// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateRun } from "../types.js";
import { patchRunStatus } from "./patch-run-status.js";

export const createRunBackup = async (run: UpdateRun): Promise<void> => {
  const backup = await run.dependencies.backup.create(run.status.currentVersion);
  await patchRunStatus(run, { backupName: backup.name });
};
