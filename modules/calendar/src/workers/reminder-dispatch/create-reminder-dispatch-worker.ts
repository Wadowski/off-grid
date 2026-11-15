// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { Logger } from "@offgrid/observability";
import type { CalendarWorker } from "../../types.js";
import { runReminderTick } from "./run-reminder-tick.js";

export interface ReminderDispatchOptions {
  readonly db: ModuleDatabase;
  readonly logger: Logger;
  readonly now: () => Date;
  readonly intervalMs: number;
  readonly batch?: number;
}

const DEFAULT_BATCH = 50;

// Runs a tick every intervalMs. It runs in the server process and needs no client connection,
// so reminders do not depend on the tunnel (ADR 0030).
export const createReminderDispatchWorker = (options: ReminderDispatchOptions): CalendarWorker => {
  const batch = options.batch ?? DEFAULT_BATCH;
  let timer: ReturnType<typeof setInterval> | undefined;
  let inFlight: Promise<void> = Promise.resolve();

  const tick = async (): Promise<void> => {
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

  return {
    name: "calendar-reminder-dispatch",
    start: async () => {
      if (timer !== undefined) {
        return;
      }
      timer = setInterval(() => {
        inFlight = inFlight.then(tick);
      }, options.intervalMs);
    },
    stop: async () => {
      if (timer !== undefined) {
        clearInterval(timer);
        timer = undefined;
      }
      await inFlight;
    },
  };
};
