// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";
import type { Subscription, StoredEvent, DeliverySettings } from "./types.js";
import { parseEvent } from "@offgrid/contracts";
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
  const handlerPool = settings.handlerPoolFor(subscription.runAs);
  for (let attempt = 1; ; attempt += 1) {
    try {
      const event = parseEvent(subscription.event, toEnvelope(stored));
      await runHandler(handlerPool, subscription, event);
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
