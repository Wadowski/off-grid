// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateRun, UpdateStepName, UpdateStepState } from "../types.js";
import { currentTimestamp } from "./current-timestamp.js";
import { patchRunStatus } from "./patch-run-status.js";
import { upsertStepState } from "./upsert-step-state.js";

export const recordRunStep = async (
  run: UpdateRun,
  name: UpdateStepName,
  state: UpdateStepState,
): Promise<void> => {
  const steps = upsertStepState(
    run.status.steps,
    name,
    state,
    currentTimestamp(run.dependencies.clock),
  );
  await patchRunStatus(run, { steps });
};
