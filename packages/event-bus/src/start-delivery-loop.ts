// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Client } from "pg";
import { runDeliveryLoop } from "./run-delivery-loop.js";
import type { Deliver, DeliveryLoopState, DeliverySettings, OnNotification } from "./types.js";

export const startDeliveryLoop = async (
  state: DeliveryLoopState,
  settings: DeliverySettings,
  deliver: Deliver,
  listener: Client | undefined,
  onNotification: OnNotification,
): Promise<void> => {
  if (state.running) {
    return;
  }
  if (listener !== undefined) {
    await listener.query("LISTEN outbox_event");
    listener.on("notification", onNotification);
  }
  state.running = true;
  state.loop = runDeliveryLoop(state, settings, deliver);
};
