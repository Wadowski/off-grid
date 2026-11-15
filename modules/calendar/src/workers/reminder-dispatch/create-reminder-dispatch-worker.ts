// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { Logger } from "@offgrid/observability";
import type { CalendarWorker } from "../../types.js";
import { runReminderTick } from "./run-reminder-tick.js";

interface ReminderDispatchOptions {
  readonly db: ModuleDatabase;
  readonly logger: Logger;
  readonly now: () => Date;
  readonly intervalMs: number;
  readonly batch?: number;
}

const DEFAULT_BATCH = 50;

export const createReminderDispatchWorker = (options: ReminderDispatchOptions): CalendarWorker => {
  const batch = options.batch ?? DEFAULT_BATCH;
  let timer: ReturnType<typeof setInterval> | undefined;
  let running: Promise<void> | undefined;

  const dispatchOnce = async (): Promise<void> => {
    try {
      const count = await runReminderTick(options.db, { now: options.now(), batch });
      if (count > 0) {
        options.logger.info("calendar reminders dispatched", { count });
      }
    } catch (error) {
      options.logger.error("calendar reminder tick failed", {
        error: error instanceof Error ? error.name : "unknown",
      });
    }
  };

  const tickUnlessRunning = (): void => {
    if (running !== undefined) {
      return;
    }
    running = dispatchOnce().finally(() => {
      running = undefined;
    });
  };

  return {
    name: "calendar-reminder-dispatch",
    start: async () => {
      if (timer !== undefined) {
        return;
      }
      timer = setInterval(tickUnlessRunning, options.intervalMs);
    },
    stop: async () => {
      if (timer !== undefined) {
        clearInterval(timer);
        timer = undefined;
      }
      await running;
    },
  };
};
