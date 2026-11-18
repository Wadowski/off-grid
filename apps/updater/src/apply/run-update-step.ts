// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateRun, UpdateStepName } from "../types.js";
import { UpdateStepFailedError } from "./errors/update-step-failed-error.js";
import { recordRunStep } from "./record-run-step.js";

export const runUpdateStep = async <Result>(
  run: UpdateRun,
  name: UpdateStepName,
  action: () => Result | Promise<Result>,
): Promise<Result> => {
  try {
    await recordRunStep(run, name, "running");
    const result = await action();
    await recordRunStep(run, name, "succeeded");
    return result;
  } catch (cause) {
    await recordRunStep(run, name, "failed").catch(() => undefined);
    throw new UpdateStepFailedError(name, { cause });
  }
};
