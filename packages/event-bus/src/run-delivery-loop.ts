// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { deliverSafely } from "./deliver-safely.js";
import { waitForWake } from "./wait-for-wake.js";
import type { Deliver, DeliveryLoopState, DeliverySettings } from "./types.js";

export const runDeliveryLoop = async (
  state: DeliveryLoopState,
  settings: DeliverySettings,
  deliver: Deliver,
): Promise<void> => {
  while (state.running) {
    await deliverSafely(settings, deliver);
    await waitForWake(state, settings);
  }
};
