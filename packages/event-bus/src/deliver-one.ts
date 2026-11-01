// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";
import { parseEvent } from "@offgrid/contracts";
import type { Subscription, StoredEvent, DeliverySettings, EventOf } from "./types.js";
import { toEnvelope } from "./to-envelope.js";
import { deadLetter } from "./dead-letter.js";
import { runHandler } from "./run-handler.js";
import { sleep } from "./sleep.js";

export const deliverOne = async (
  busClient: ClientBase,
  subscription: Subscription,
  stored: StoredEvent,
  settings: DeliverySettings,
): Promise<void> => {
  if (stored.type !== subscription.event.name) {
    return;
  }
  let event: EventOf<typeof subscription.event>;
  try {
    event = parseEvent(subscription.event, toEnvelope(stored));
  } catch (error) {
    await deadLetter(busClient, subscription, stored, 1, error, settings);
    return;
  }
  for (let attempt = 1; ; attempt += 1) {
    try {
      await runHandler(settings.pool, subscription, event);
      return;
    } catch (error) {
      if (attempt >= settings.maxAttempts) {
        await deadLetter(busClient, subscription, stored, attempt, error, settings);
        return;
      }
      await sleep(settings.retryDelayMs(attempt));
    }
  }
};
