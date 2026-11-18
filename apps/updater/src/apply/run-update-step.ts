// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateRun, UpdateStepName } from "../types.js";
import { UpdateStepFailedError } from "./errors/update-step-failed-error.js";
import { recordRunStep } from "./record-run-step.js";

export const runUpdateStep = async <Result>(
  run: UpdateRun,
  name: UpdateStepName,
  action: () => Promise<Result>,
): Promise<Result> => {
  await recordRunStep(run, name, "running");
  let result: Result;
  try {
    result = await action();
  } catch (cause) {
    await recordRunStep(run, name, "failed");
    throw new UpdateStepFailedError(name, { cause });
  }
  await recordRunStep(run, name, "succeeded");
  return result;
};
