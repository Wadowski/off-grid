// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { UPDATE_OUTCOME_MESSAGES } from "../constants.js";
import type { UpdateOutcome, UpdateRun, UpdateStatus, UpdateStepName } from "../types.js";
import { currentTimestamp } from "./current-timestamp.js";
import { patchRunStatus } from "./patch-run-status.js";
import { skipPendingSteps } from "./skip-pending-steps.js";

export const finishRun = async (
  run: UpdateRun,
  outcome: UpdateOutcome,
  failedStep: UpdateStepName | null,
): Promise<UpdateStatus> => {
  await skipPendingSteps(run);
  await patchRunStatus(run, {
    outcome,
    failedStep,
    finishedAt: currentTimestamp(run.dependencies.clock),
    message: UPDATE_OUTCOME_MESSAGES[outcome],
  });
  return run.status;
};
