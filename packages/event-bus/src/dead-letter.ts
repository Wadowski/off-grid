// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";
import type { Subscription, StoredEvent, DeliverySettings } from "./types.js";
import { recordDeadLetter } from "./record-dead-letter.js";

export const deadLetter = async (
  client: ClientBase,
  subscription: Subscription,
  stored: StoredEvent,
  attempts: number,
  error: unknown,
  settings: DeliverySettings,
): Promise<void> => {
  const errorName = error instanceof Error ? error.name : "NonError";
  await recordDeadLetter(client, subscription.name, stored.sequence, attempts, errorName);
  settings.errorSink.record(error, {
    subscriber: subscription.name,
    event_id: stored.id,
    event_sequence: stored.sequence,
  });
};
