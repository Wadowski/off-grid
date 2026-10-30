// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Client } from "pg";
import type { DeliveryLoopState, OnNotification } from "./types.js";

export const stopDeliveryLoop = async (
  state: DeliveryLoopState,
  listener: Client | undefined,
  onNotification: OnNotification,
): Promise<void> => {
  if (!state.running) {
    return;
  }
  state.running = false;
  state.wake?.();
  await state.loop;
  if (listener !== undefined) {
    listener.off("notification", onNotification);
    await listener.query("UNLISTEN outbox_event");
  }
};
