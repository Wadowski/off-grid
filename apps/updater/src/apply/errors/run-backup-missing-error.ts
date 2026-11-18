// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateStepName } from "../../types.js";

export class RunBackupMissingError extends Error {
  constructor(readonly step: UpdateStepName) {
    super(`update step ${step} has no backup to restore`);
    this.name = "RunBackupMissingError";
  }
}
