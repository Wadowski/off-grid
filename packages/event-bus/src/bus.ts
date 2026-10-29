// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { parseEvent, type AnyEventDefinition } from "@offgrid/contracts";
import { type ErrorSink, resolveTraceId, runWithTrace } from "@offgrid/observability";
import type { ClientBase, Pool } from "pg";
import {
  advanceCursor,
  lockCursor,
  readEventsAfter,
  recordDeadLetter,
  type StoredEvent,
} from "./store.js";

export type EventOf<D extends AnyEventDefinition> = ReturnType<D["envelope"]["parse"]>;

export interface HandlerContext {
  readonly tx: ClientBase;
}

export interface Subscription<D extends AnyEventDefinition = AnyEventDefinition> {
  readonly name: string;
  readonly event: D;
  readonly pool: Pool;
  readonly handler: (event: EventOf<D>, context: HandlerContext) => Promise<void>;
}

export interface EventTransport<D extends AnyEventDefinition = AnyEventDefinition> {
  send(event: EventOf<D>): Promise<void>;
}

export interface EventBusOptions {
  readonly errorSink: ErrorSink;
  readonly maxAttempts?: number;
  readonly retryDelayMs?: (attempt: number) => number;
  readonly batchSize?: number;
}

export interface EventBus {
  subscribe<D extends AnyEventDefinition>(subscription: Subscription<D>): void;
  subscribeTransport<D extends AnyEventDefinition>(options: {
    readonly name: string;
    readonly event: D;
    readonly pool: Pool;
    readonly transport: EventTransport<D>;
  }): void;
  deliverPending(): Promise<void>;
}

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_BATCH_SIZE = 100;
const defaultRetryDelayMs = (attempt: number): number => 100 * 2 ** (attempt - 1);

export function createEventBus(options: EventBusOptions): EventBus {
  const settings = {
    errorSink: options.errorSink,
    maxAttempts: options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
    retryDelayMs: options.retryDelayMs ?? defaultRetryDelayMs,
    batchSize: options.batchSize ?? DEFAULT_BATCH_SIZE,
  };
  const subscriptions: Subscription[] = [];

  const subscribe = <D extends AnyEventDefinition>(subscription: Subscription<D>): void => {
    assertNameFree(subscriptions, subscription.name);
    subscriptions.push(subscription as unknown as Subscription);
  };

  return {
    subscribe,
    subscribeTransport({ name, event, pool, transport }) {
      subscribe({
        name,
        event,
        pool,
        handler: (envelope) => transport.send(envelope),
      });
    },
    async deliverPending() {
      for (const subscription of subscriptions) {
        await drainSubscription(subscription, settings);
      }
    },
  };
}

function assertNameFree(subscriptions: readonly Subscription[], name: string): void {
  if (subscriptions.some((subscription) => subscription.name === name)) {
    throw new Error(`subscriber "${name}" is already registered`);
  }
}

interface Settings {
  readonly errorSink: ErrorSink;
  readonly maxAttempts: number;
  readonly retryDelayMs: (attempt: number) => number;
  readonly batchSize: number;
}

async function drainSubscription(subscription: Subscription, settings: Settings): Promise<void> {
  let hasMore = true;
  while (hasMore) {
    hasMore = await deliverBatch(subscription, settings);
  }
}

async function deliverBatch(subscription: Subscription, settings: Settings): Promise<boolean> {
  const client = await subscription.pool.connect();
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
}

async function deliverOne(
  client: ClientBase,
  subscription: Subscription,
  stored: StoredEvent,
  settings: Settings,
): Promise<void> {
  if (stored.type !== subscription.event.name) {
    return;
  }
  for (let attempt = 1; ; attempt += 1) {
    await client.query("SAVEPOINT delivery");
    try {
      const event = parseEvent(subscription.event, toEnvelope(stored));
      await runWithTrace(resolveTraceId(event.traceId), () =>
        subscription.handler(event, { tx: client }),
      );
      await client.query("RELEASE SAVEPOINT delivery");
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
}

async function deadLetter(
  client: ClientBase,
  subscription: Subscription,
  stored: StoredEvent,
  attempts: number,
  error: unknown,
  settings: Settings,
): Promise<void> {
  const errorName = error instanceof Error ? error.name : "NonError";
  await recordDeadLetter(client, subscription.name, stored.sequence, attempts, errorName);
  settings.errorSink.record(error, {
    subscriber: subscription.name,
    event_id: stored.id,
    event_sequence: stored.sequence,
  });
}

function toEnvelope(stored: StoredEvent) {
  return {
    id: stored.id,
    type: stored.type,
    version: stored.version,
    occurredAt: stored.occurredAt,
    traceId: stored.traceId,
    familyId: stored.familyId,
    sourceVersion: stored.sourceVersion,
    payload: stored.payload,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
