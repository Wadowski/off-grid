// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateRun } from "../types.js";
import { currentTimestamp } from "./current-timestamp.js";
import { patchRunStatus } from "./patch-run-status.js";
import { upsertStepState } from "./upsert-step-state.js";

export const skipPendingSteps = async (run: UpdateRun): Promise<void> => {
  const timestamp = currentTimestamp(run.dependencies.clock);
  const steps = run.status.steps
    .filter((step) => step.state === "pending")
    .reduce(
      (current, step) => upsertStepState(current, step.name, "skipped", timestamp),
      run.status.steps,
    );
  await patchRunStatus(run, { steps });
};
