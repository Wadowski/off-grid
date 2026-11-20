// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NightlySchedulerDependencies } from "../types.js";
import { nextNightlyRunAt } from "./next-nightly-run-at.js";
import { runNightlySlots } from "./run-nightly-slots.js";

export const startNightlyScheduler = (dependencies: NightlySchedulerDependencies): (() => void) => {
  const control = { stopped: false };
  const firstSlot = nextNightlyRunAt(new Date(dependencies.clock.now()), dependencies.nightlyTime);
  dependencies.logger.info("nightly update scheduled", { runAt: firstSlot.toISOString() });
  void runNightlySlots(dependencies, control, firstSlot);
  return () => {
    control.stopped = true;
  };
};
