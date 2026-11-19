// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateRunState, UpdateStatus } from "../../types.js";

export const runStateOfOutcome = (outcome: UpdateStatus["outcome"]): UpdateRunState => {
  switch (outcome) {
    case "in_progress":
      return "interrupted";
    case "succeeded":
      return "succeeded";
    case "rolled_back":
      return "rolled_back";
    case "failed_needs_admin":
      return "needs_admin";
    case "refused":
    case "failed_before_change":
      return "failed";
  }
};
