// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NightlySchedulerControl, NightlySchedulerDependencies } from "../types.js";
import { nextNightlyRunAt } from "./next-nightly-run-at.js";

export const runNightlySlots = async (
  dependencies: NightlySchedulerDependencies,
  control: NightlySchedulerControl,
  firstSlot: Date,
): Promise<void> => {
  let slot = firstSlot;
  while (!control.stopped) {
    await dependencies.clock.sleep(Math.max(0, slot.getTime() - dependencies.clock.now()));
    if (control.stopped) {
      return;
    }
    await dependencies.runTick().catch(() => {
      dependencies.logger.error("nightly update tick ended with an error");
    });
    slot = nextNightlyRunAt(slot, dependencies.nightlyTime);
  }
};
