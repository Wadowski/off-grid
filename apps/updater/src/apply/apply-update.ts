// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ApplyDependencies, ApplyRequest, UpdateStatus } from "../types.js";
import { checkUpdateAllowed } from "./check-update-allowed.js";
import { UpdateStepFailedError } from "./errors/update-step-failed-error.js";
import { finishRun } from "./finish-run.js";
import { handleStepFailure } from "./handle-step-failure.js";
import { parseApplyRequest } from "./parse-apply-request.js";
import { patchRunStatus } from "./patch-run-status.js";
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
    await runUpdateStep(run, "verify_version", async () => checkUpdateAllowed(parsedRequest));
    const backup = await runUpdateStep(run, "backup", () =>
      dependencies.backup.create(parsedRequest.currentVersion),
    );
    await patchRunStatus(run, { backupName: backup.name });
    await runForwardSteps(run);
    return await finishRun(run, "succeeded", null);
  } catch (error) {
    if (error instanceof UpdateStepFailedError) {
      return handleStepFailure(run, error);
    }
    throw error;
  }
};
