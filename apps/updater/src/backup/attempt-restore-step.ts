// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { RestoreFailedError } from "./errors/restore-failed-error.js";

export const attemptRestoreStep = async (step: string, action: () => Promise<void>): Promise<void> => {
  try {
    await action();
  } catch {
    throw new RestoreFailedError(step);
  }
};
