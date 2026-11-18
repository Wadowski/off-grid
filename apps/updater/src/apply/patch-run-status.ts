// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateRun, UpdateStatus } from "../types.js";

export const patchRunStatus = async (
  run: UpdateRun,
  changes: Partial<UpdateStatus>,
): Promise<void> => {
  run.status = { ...run.status, ...changes };
  await run.dependencies.statusStore.write(run.status);
};
