// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";
import { parseEvent, type AnyEventDefinition } from "@offgrid/contracts";
import type { Delivery, StoredEvent, DeliverySettings, EventOf } from "./types.js";
import { toEnvelope } from "./to-envelope.js";
import { deadLetter } from "./dead-letter.js";
import { runHandler } from "./run-handler.js";
import { sleep } from "./sleep.js";
import { SubscriptionHalted } from "./subscription-halted.js";

export const deliverOne = async (
  busClient: ClientBase,
  subscription: Delivery,
  stored: StoredEvent,
  settings: DeliverySettings,
): Promise<void> => {
  const definition = subscription.events.find((candidate) => candidate.name === stored.type);
  if (definition === undefined) {
    return;
  }
  let event: EventOf<AnyEventDefinition>;
  try {
    event = parseEvent(definition, toEnvelope(stored));
  } catch (error) {
    await giveUp(busClient, subscription, stored, 1, error, settings);
    return;
  }
  for (let attempt = 1; ; attempt += 1) {
    try {
      await runHandler(settings.pool, subscription, event);
      return;
    } catch (error) {
      if (attempt >= settings.maxAttempts) {
        await giveUp(busClient, subscription, stored, attempt, error, settings);
        return;
      }
      await sleep(settings.retryDelayMs(attempt));
    }
  }
};

const giveUp = async (
  busClient: ClientBase,
  subscription: Delivery,
  stored: StoredEvent,
  attempts: number,
  error: unknown,
  settings: DeliverySettings,
): Promise<void> => {
  if (subscription.onFailure === "halt") {
    settings.errorSink.record(error, {
      subscriber: subscription.name,
      event_id: stored.id,
      event_sequence: stored.sequence,
      attempts,
    });
    throw new SubscriptionHalted(subscription.name, stored.sequence, error);
  }
  await deadLetter(busClient, subscription, stored, attempts, error, settings);
};
