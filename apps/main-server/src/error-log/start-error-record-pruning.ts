// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { Logger } from "@offgrid/observability";
import { ERROR_RECORD_PRUNE_INTERVAL_MS } from "../constants.js";
import { pruneErrorRecords } from "./prune-error-records.js";

export const startErrorRecordPruning = (db: ModuleDatabase, logger: Logger): (() => void) => {
  const runPrune = (): void => {
    pruneErrorRecords(db, new Date()).catch((error: unknown) => {
      logger.warn("error record pruning failed", {
        action: "error-record.prune-failed",
        reason: error instanceof Error ? error.name : "NonError",
      });
    });
  };
  runPrune();
  const timer = setInterval(runPrune, ERROR_RECORD_PRUNE_INTERVAL_MS);
  timer.unref();
  return () => {
    clearInterval(timer);
  };
};
