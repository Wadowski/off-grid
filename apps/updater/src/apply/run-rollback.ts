// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateRun } from "../types.js";
import { appendRollbackSteps } from "./append-rollback-steps.js";
import { restoreRunBackup } from "./restore-run-backup.js";
import { runUpdateStep } from "./run-update-step.js";
import { startPreviousImages } from "./start-previous-images.js";
import { waitForBothHealthy } from "./wait-for-both-healthy.js";

export const runRollback = async (run: UpdateRun): Promise<void> => {
  await appendRollbackSteps(run);
  await runUpdateStep(run, "rollback_stop", () => run.dependencies.docker.stopContainers());
  await runUpdateStep(run, "rollback_restore", () => restoreRunBackup(run));
  await runUpdateStep(run, "rollback_start", () => startPreviousImages(run));
  await runUpdateStep(run, "rollback_health", () =>
    waitForBothHealthy(run.dependencies, "rollback_health"),
  );
};
