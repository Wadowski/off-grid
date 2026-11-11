// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { PoolClient } from "pg";
import type { Delivery, DeliverySettings } from "./types.js";
import { lockCursor } from "./lock-cursor.js";
import { readEventsAfter } from "./read-events-after.js";
import { deliverOne } from "./deliver-one.js";
import { advanceCursor } from "./advance-cursor.js";

export const deliverLockedBatch = async (
  client: PoolClient,
  subscription: Delivery,
  settings: DeliverySettings,
): Promise<boolean> => {
  const position = await lockCursor(client, subscription.name);
  if (position === null) {
    return false;
  }
  const events = await readEventsAfter(client, position, null, settings.batchSize);
  for (const event of events) {
    await deliverOne(client, subscription, event, settings);
    await advanceCursor(client, subscription.name, event.sequence);
  }
  return events.length === settings.batchSize;
};
