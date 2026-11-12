// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Delivery, DeliverySettings } from "./types.js";
import { deliverLockedBatch } from "./deliver-locked-batch.js";
import { SubscriptionHalted } from "./subscription-halted.js";
import { withTransaction } from "./with-transaction.js";

export const deliverBatch = async (
  subscription: Delivery,
  settings: DeliverySettings,
): Promise<boolean> => {
  try {
    return await withTransaction(settings.pool, (client) =>
      deliverLockedBatch(client, subscription, settings),
    );
  } catch (error) {
    if (!(error instanceof SubscriptionHalted)) {
      settings.errorSink.record(error, { subscriber: subscription.name });
    }
    return false;
  }
};
