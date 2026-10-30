// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AnyEventDefinition } from "@offgrid/contracts";
import type { Subscription, ReplayOptions } from "./types.js";
import { DEFAULT_REPLAY_BATCH_SIZE } from "./constants.js";
import { readEventsAfter } from "./read-events-after.js";
import { toTypedEvent } from "./to-typed-event.js";
import { setRole } from "./set-role.js";
import { resolveTraceId, runWithTrace } from "@offgrid/observability";
import { resetRole } from "./reset-role.js";

export const replayEvents = async <D extends AnyEventDefinition>(
  subscription: Pick<Subscription<D>, "event" | "runAs" | "handler">,
  options: ReplayOptions,
): Promise<number> => {
  const batchSize = options.batchSize ?? DEFAULT_REPLAY_BATCH_SIZE;
  let after = (options.fromSequence ?? 1) - 1;
  let delivered = 0;
  let hasMore = true;
  while (hasMore) {
    const client = await options.pool.connect();
    try {
      await client.query("BEGIN");
      const stored = await readEventsAfter(client, after, subscription.event.name, batchSize);
      for (const row of stored) {
        const event = toTypedEvent(subscription.event, row);
        await setRole(client, subscription.runAs);
        await runWithTrace(resolveTraceId(event.traceId), () =>
          subscription.handler(event, { tx: client }),
        );
        await resetRole(client);
        delivered += 1;
        after = row.sequence;
      }
      await client.query("COMMIT");
      hasMore = stored.length === batchSize;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }
  return delivered;
};
