// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Client } from "pg";
import { startDeliveryLoop } from "./start-delivery-loop.js";
import { stopDeliveryLoop } from "./stop-delivery-loop.js";
import { wakeOnNotification } from "./wake-on-notification.js";
import type { Deliver, DeliveryLoop, DeliveryLoopState, DeliverySettings } from "./types.js";

export const createDeliveryLoop = (
  settings: DeliverySettings,
  deliver: Deliver,
  listener: Client | undefined,
): DeliveryLoop => {
  const state: DeliveryLoopState = { running: false, loop: undefined, wake: undefined };
  const onNotification = wakeOnNotification(state);
  return {
    start: () => startDeliveryLoop(state, settings, deliver, listener, onNotification),
    stop: () => stopDeliveryLoop(state, listener, onNotification),
  };
};
