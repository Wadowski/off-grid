// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { EventBus } from "@offgrid/event-bus";
import type { Logger } from "@offgrid/observability";
import { OUTBOX_PRUNE_INTERVAL_MS, SECONDS_PER_DAY } from "../constants.js";

export const startOutboxPruning = (
  eventBus: EventBus,
  retentionDays: number,
  logger: Logger,
): (() => void) => {
  const retentionSeconds = retentionDays * SECONDS_PER_DAY;
  const runPrune = (): void => {
    eventBus.prune(retentionSeconds).catch((error: unknown) => {
      logger.warn("outbox pruning failed", {
        action: "outbox.prune-failed",
        reason: error instanceof Error ? error.name : "NonError",
      });
    });
  };
  runPrune();
  const timer = setInterval(runPrune, OUTBOX_PRUNE_INTERVAL_MS);
  timer.unref();
  return () => {
    clearInterval(timer);
  };
};
