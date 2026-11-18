// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateRun, UpdateStatus } from "../types.js";
import type { UpdateStepFailedError } from "./errors/update-step-failed-error.js";
import { finishRun } from "./finish-run.js";
import { rollBackAfterFailure } from "./roll-back-after-failure.js";

export const handleStepFailure = async (
  run: UpdateRun,
  failure: UpdateStepFailedError,
): Promise<UpdateStatus> => {
  if (failure.step === "verify_version") {
    return finishRun(run, "refused", failure.step);
  }
  if (failure.step === "backup" || failure.step === "pull") {
    return finishRun(run, "failed_before_change", failure.step);
  }
  return rollBackAfterFailure(run, failure.step);
};
