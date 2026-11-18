// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { BackupFailedError } from "./errors/backup-failed-error.js";

export const attemptBackupStep = async (step: string, action: () => Promise<void>): Promise<void> => {
  try {
    await action();
  } catch {
    throw new BackupFailedError(step);
  }
};
