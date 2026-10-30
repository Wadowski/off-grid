// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Deliver, DeliverySettings } from "./types.js";

export const deliverSafely = async (
  settings: DeliverySettings,
  deliver: Deliver,
): Promise<void> => {
  try {
    await deliver();
  } catch (error) {
    settings.errorSink.record(error, { component: "delivery-loop" });
  }
};
