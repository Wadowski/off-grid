// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SystemUpdate } from "../../types.js";

export const toUpdateResultTextId = (update: SystemUpdate) => {
  if (update.runState === "interrupted") {
    return "admin.update.interrupted" as const;
  }
  switch (update.lastRun?.outcome) {
    case "succeeded":
      return "admin.update.succeeded" as const;
    case "rolled_back":
      return "admin.update.rolledBack" as const;
    case "failed_needs_admin":
      return "admin.update.needsAdmin" as const;
    case "failed_before_change":
    case "refused":
      return "admin.update.failed" as const;
    default:
      return null;
  }
};
