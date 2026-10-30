// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DeliveryLoopState, DeliverySettings } from "./types.js";

export const waitForWake = (state: DeliveryLoopState, settings: DeliverySettings): Promise<void> =>
  new Promise((resolve) => {
    const finish = (): void => {
      clearTimeout(timer);
      state.wake = undefined;
      resolve();
    };
    const timer = setTimeout(finish, settings.pollIntervalMs);
    state.wake = finish;
  });
