// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Subscription, DeliverySettings } from "./types.js";
import { deliverBatch } from "./deliver-batch.js";

export const deliverAll = async (
  subscriptions: readonly Subscription[],
  settings: DeliverySettings,
): Promise<void> => {
  for (const subscription of subscriptions) {
    let hasMore = true;
    while (hasMore) {
      hasMore = await deliverBatch(subscription, settings);
    }
  }
};
