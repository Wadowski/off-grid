// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FORWARD_STEP_NAMES, UPDATE_OUTCOME_MESSAGES } from "../constants.js";
import type { UpdateStatus } from "../types.js";

export const createInitialStatus = (
  runId: string,
  currentVersion: string,
  targetVersion: string,
  startedAt: string,
): UpdateStatus => ({
  runId,
  currentVersion,
  targetVersion,
  startedAt,
  finishedAt: null,
  outcome: "in_progress",
  failedStep: null,
  steps: FORWARD_STEP_NAMES.map((name) => ({
    name,
    state: "pending",
    startedAt: null,
    finishedAt: null,
  })),
  backupName: null,
  previousImages: null,
  writesAfterBackupLost: false,
  message: UPDATE_OUTCOME_MESSAGES.in_progress,
});
