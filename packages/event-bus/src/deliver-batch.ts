// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Subscription, DeliverySettings } from "./types.js";
import { lockCursor } from "./lock-cursor.js";
import { readEventsAfter } from "./read-events-after.js";
import { deliverOne } from "./deliver-one.js";
import { advanceCursor } from "./advance-cursor.js";

export const deliverBatch = async (
  subscription: Subscription,
  settings: DeliverySettings,
): Promise<boolean> => {
  const client = await settings.pool.connect();
  try {
    await client.query("BEGIN");
    const position = await lockCursor(client, subscription.name);
    if (position === null) {
      await client.query("ROLLBACK");
      return false;
    }
    const events = await readEventsAfter(client, position, null, settings.batchSize);
    for (const event of events) {
      await deliverOne(client, subscription, event, settings);
    }
    const last = events.at(-1);
    if (last !== undefined) {
      await advanceCursor(client, subscription.name, last.sequence);
    }
    await client.query("COMMIT");
    return events.length === settings.batchSize;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    settings.errorSink.record(error, { subscriber: subscription.name });
    return false;
  } finally {
    client.release();
  }
};
