// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AnyEventDefinition } from "@offgrid/contracts";
import type { Subscription, ReplayOptions } from "./types.js";
import { DEFAULT_REPLAY_BATCH_SIZE } from "./constants.js";
import { assertModuleName } from "./assert-module-name.js";
import { readBatch } from "./read-batch.js";
import { toTypedEvent } from "./to-typed-event.js";
import { runHandler } from "./run-handler.js";

export const replayEvents = async <D extends AnyEventDefinition>(
  subscription: Pick<Subscription<D>, "event" | "runAs" | "handler">,
  options: ReplayOptions,
): Promise<number> => {
  assertModuleName(subscription.runAs);
  const batchSize = options.batchSize ?? DEFAULT_REPLAY_BATCH_SIZE;
  let after = (options.fromSequence ?? 1) - 1;
  let delivered = 0;
  let hasMore = true;
  while (hasMore) {
    const stored = await readBatch(options.pool, subscription.event.name, after, batchSize);
    for (const row of stored) {
      await runHandler(options.pool, subscription, toTypedEvent(subscription.event, row));
      delivered += 1;
      after = row.sequence;
    }
    hasMore = stored.length === batchSize;
  }
  return delivered;
};
