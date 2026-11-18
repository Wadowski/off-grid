// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ApplyDependencies, ApplyRequest, UpdateStatus } from "../types.js";
import { checkUpdateAllowed } from "./check-update-allowed.js";
import { createRunBackup } from "./create-run-backup.js";
import { UpdateStepFailedError } from "./errors/update-step-failed-error.js";
import { finishRun } from "./finish-run.js";
import { handleStepFailure } from "./handle-step-failure.js";
import { parseApplyRequest } from "./parse-apply-request.js";
import { runForwardSteps } from "./run-forward-steps.js";
import { runUpdateStep } from "./run-update-step.js";
import { startUpdateRun } from "./start-update-run.js";

export const applyUpdate = async (
  dependencies: ApplyDependencies,
  request: ApplyRequest,
): Promise<UpdateStatus> => {
  const parsedRequest = parseApplyRequest(request);
  const run = await startUpdateRun(dependencies, parsedRequest);
  try {
    await runUpdateStep(run, "verify_version", () => checkUpdateAllowed(parsedRequest));
    await runUpdateStep(run, "backup", () => createRunBackup(run));
    await runForwardSteps(run);
    return await finishRun(run, "succeeded", null);
  } catch (error) {
    if (error instanceof UpdateStepFailedError) {
      return handleStepFailure(run, error);
    }
    throw error;
  }
};
