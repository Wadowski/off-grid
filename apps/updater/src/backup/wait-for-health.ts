// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { HEALTH_POLL_INTERVAL_MILLISECONDS } from "../constants.js";
import type { Clock, HealthProbe } from "../types.js";

export const waitForHealth = async (
  probe: HealthProbe,
  clock: Clock,
  timeoutMilliseconds: number,
): Promise<boolean> => {
  const deadline = clock.now() + timeoutMilliseconds;
  for (;;) {
    if (await probe()) {
      return true;
    }
    const remainingMilliseconds = deadline - clock.now();
    if (remainingMilliseconds <= 0) {
      return false;
    }
    await clock.sleep(Math.min(HEALTH_POLL_INTERVAL_MILLISECONDS, remainingMilliseconds));
  }
};
