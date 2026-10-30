// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Subscription, DeliverySettings } from "./types.js";
import { deliverLockedBatch } from "./deliver-locked-batch.js";
import { withTransaction } from "./with-transaction.js";

export const deliverBatch = async (
  subscription: Subscription,
  settings: DeliverySettings,
): Promise<boolean> => {
  try {
    return await withTransaction(settings.pool, (client) =>
      deliverLockedBatch(client, subscription, settings),
    );
  } catch (error) {
    settings.errorSink.record(error, { subscriber: subscription.name });
    return false;
  }
};
