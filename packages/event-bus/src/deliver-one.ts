// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";
import type { Subscription, StoredEvent, DeliverySettings } from "./types.js";
import { parseEvent } from "@offgrid/contracts";
import { toEnvelope } from "./to-envelope.js";
import { setRole } from "./set-role.js";
import { resolveTraceId, runWithTrace } from "@offgrid/observability";
import { resetRole } from "./reset-role.js";
import { deadLetter } from "./dead-letter.js";
import { sleep } from "./sleep.js";

export const deliverOne = async (
  client: ClientBase,
  subscription: Subscription,
  stored: StoredEvent,
  settings: DeliverySettings,
): Promise<void> => {
  if (stored.type !== subscription.event.name) {
    return;
  }
  for (let attempt = 1; ; attempt += 1) {
    await client.query("SAVEPOINT delivery");
    try {
      const event = parseEvent(subscription.event, toEnvelope(stored));
      await setRole(client, subscription.runAs);
      await runWithTrace(resolveTraceId(event.traceId), () =>
        subscription.handler(event, { tx: client }),
      );
      await client.query("RELEASE SAVEPOINT delivery");
      await resetRole(client);
      return;
    } catch (error) {
      await client.query("ROLLBACK TO SAVEPOINT delivery");
      if (attempt >= settings.maxAttempts) {
        await deadLetter(client, subscription, stored, attempt, error, settings);
        return;
      }
      await sleep(settings.retryDelayMs(attempt));
    }
  }
};
