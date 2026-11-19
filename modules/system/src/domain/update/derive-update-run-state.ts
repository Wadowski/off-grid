// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateRunState, UpdateStatus } from "../../types.js";
import { runStateOfOutcome } from "./run-state-of-outcome.js";

export const deriveUpdateRunState = (
  update: UpdateStatus | null,
  running: boolean,
): UpdateRunState => {
  if (running) {
    return "running";
  }
  if (update === null) {
    return "idle";
  }
  return runStateOfOutcome(update.outcome);
};
