// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ROLLBACK_STEP_NAMES } from "@offgrid/contracts";
import type { UpdateRun } from "../types.js";
import { currentTimestamp } from "./current-timestamp.js";
import { patchRunStatus } from "./patch-run-status.js";
import { upsertStepState } from "./upsert-step-state.js";

export const appendRollbackSteps = async (run: UpdateRun): Promise<void> => {
  const timestamp = currentTimestamp(run.dependencies.clock);
  const steps = ROLLBACK_STEP_NAMES.reduce(
    (current, name) => upsertStepState(current, name, "pending", timestamp),
    run.status.steps,
  );
  await patchRunStatus(run, { steps });
};
