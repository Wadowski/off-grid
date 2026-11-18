// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateRun, UpdateStatus, UpdateStepName } from "../types.js";
import { UpdateStepFailedError } from "./errors/update-step-failed-error.js";
import { finishRun } from "./finish-run.js";
import { runRollback } from "./run-rollback.js";

export const rollBackAfterFailure = async (
  run: UpdateRun,
  failedStep: UpdateStepName,
): Promise<UpdateStatus> => {
  try {
    await runRollback(run);
  } catch (error) {
    const rollbackFailedStep = error instanceof UpdateStepFailedError ? error.step : null;
    return finishRun(run, "failed_needs_admin", rollbackFailedStep);
  }
  return finishRun(run, "rolled_back", failedStep);
};
