// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AnyEventDefinition } from "@offgrid/contracts";
import type { EventBusOptions, EventBus, DeliverySettings, Subscription } from "./types.js";
import {
  DEFAULT_BATCH_SIZE,
  DEFAULT_MAX_ATTEMPTS,
  DEFAULT_POLL_INTERVAL_MS,
  TRANSPORT_RUN_AS,
} from "./constants.js";
import { assertModuleName } from "./assert-module-name.js";
import { defaultRetryDelayMs } from "./default-retry-delay-ms.js";
import { createDeliveryLoop } from "./create-delivery-loop.js";
import { deliverAll } from "./deliver-all.js";
import { pruneDelivered } from "./prune-delivered.js";

export const createEventBus = (options: EventBusOptions): EventBus => {
  const settings: DeliverySettings = {
    pool: options.pool,
    errorSink: options.errorSink,
    maxAttempts: options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
    retryDelayMs: options.retryDelayMs ?? defaultRetryDelayMs,
    batchSize: options.batchSize ?? DEFAULT_BATCH_SIZE,
    pollIntervalMs: options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS,
  };
  const subscriptions: Subscription[] = [];
  const loop = createDeliveryLoop(
    settings,
    () => deliverAll(subscriptions, settings),
    options.listener,
  );

  const register = <D extends AnyEventDefinition>(subscription: Subscription<D>): void => {
    if (subscriptions.some((existing) => existing.name === subscription.name)) {
      throw new Error(`subscriber "${subscription.name}" is already registered`);
    }
    subscriptions.push(subscription);
  };

  return {
    subscribe: (subscription) => {
      assertModuleName(subscription.runAs);
      register(subscription);
    },
    subscribeTransport: ({ name, event, transport }) => {
      register({
        name,
        event,
        runAs: TRANSPORT_RUN_AS,
        handler: (envelope) => transport.send(envelope),
      });
    },
    deliverPending: () => deliverAll(subscriptions, settings),
    start: () => loop.start(),
    stop: () => loop.stop(),
    prune: async (retentionSeconds) => {
      const client = await settings.pool.connect();
      try {
        return await pruneDelivered(client, retentionSeconds);
      } finally {
        client.release();
      }
    },
  };
};
