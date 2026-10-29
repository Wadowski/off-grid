// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { parseEvent, type AnyEventDefinition } from "@offgrid/contracts";
import { type ErrorSink, resolveTraceId, runWithTrace } from "@offgrid/observability";
import type { Client, ClientBase, Pool } from "pg";
import {
  advanceCursor,
  lockCursor,
  pruneDelivered,
  readEventsAfter,
  recordDeadLetter,
  resetRole,
  roleOf,
  setRole,
  type StoredEvent,
} from "./store.js";

export type EventOf<D extends AnyEventDefinition> = ReturnType<D["envelope"]["parse"]>;

export interface HandlerContext {
  readonly tx: ClientBase;
}

export interface Subscription<D extends AnyEventDefinition = AnyEventDefinition> {
  readonly name: string;
  readonly event: D;
  readonly runAs: string;
  readonly handler: (event: EventOf<D>, context: HandlerContext) => Promise<void>;
}

export interface EventTransport<D extends AnyEventDefinition = AnyEventDefinition> {
  send(event: EventOf<D>): Promise<void>;
}

export interface EventBusOptions {
  readonly pool: Pool;
  readonly errorSink: ErrorSink;
  readonly listener?: Client;
  readonly maxAttempts?: number;
  readonly retryDelayMs?: (attempt: number) => number;
  readonly batchSize?: number;
  readonly pollIntervalMs?: number;
}

export interface EventBus {
  subscribe<D extends AnyEventDefinition>(subscription: Subscription<D>): void;
  subscribeTransport<D extends AnyEventDefinition>(options: {
    readonly name: string;
    readonly event: D;
    readonly transport: EventTransport<D>;
  }): void;
  deliverPending(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  prune(retentionSeconds: number): Promise<number>;
}

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_BATCH_SIZE = 100;
const DEFAULT_POLL_INTERVAL_MS = 1000;
const TRANSPORT_RUN_AS = "outbox";
const defaultRetryDelayMs = (attempt: number): number => 100 * 2 ** (attempt - 1);

interface Settings {
  readonly pool: Pool;
  readonly errorSink: ErrorSink;
  readonly maxAttempts: number;
  readonly retryDelayMs: (attempt: number) => number;
  readonly batchSize: number;
  readonly pollIntervalMs: number;
}

export function createEventBus(options: EventBusOptions): EventBus {
  const settings: Settings = {
    pool: options.pool,
    errorSink: options.errorSink,
    maxAttempts: options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
    retryDelayMs: options.retryDelayMs ?? defaultRetryDelayMs,
    batchSize: options.batchSize ?? DEFAULT_BATCH_SIZE,
    pollIntervalMs: options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS,
  };
  const subscriptions: Subscription[] = [];
  const loop = new DeliveryLoop(
    settings,
    () => deliverAll(subscriptions, settings),
    options.listener,
  );

  const subscribe = <D extends AnyEventDefinition>(subscription: Subscription<D>): void => {
    if (subscriptions.some((existing) => existing.name === subscription.name)) {
      throw new Error(`subscriber "${subscription.name}" is already registered`);
    }
    roleOf(subscription.runAs);
    subscriptions.push(subscription as unknown as Subscription);
  };

  return {
    subscribe,
    subscribeTransport({ name, event, transport }) {
      subscribe({
        name,
        event,
        runAs: TRANSPORT_RUN_AS,
        handler: (envelope) => transport.send(envelope),
      });
    },
    deliverPending: () => deliverAll(subscriptions, settings),
    start: () => loop.start(),
    stop: () => loop.stop(),
    async prune(retentionSeconds) {
      const client = await settings.pool.connect();
      try {
        return await pruneDelivered(client, retentionSeconds);
      } finally {
        client.release();
      }
    },
  };
}

async function deliverAll(
  subscriptions: readonly Subscription[],
  settings: Settings,
): Promise<void> {
  for (const subscription of subscriptions) {
    let hasMore = true;
    while (hasMore) {
      hasMore = await deliverBatch(subscription, settings);
    }
  }
}

async function deliverBatch(subscription: Subscription, settings: Settings): Promise<boolean> {
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

class DeliveryLoop {
  private running = false;
  private loop: Promise<void> | undefined;
  private wake: (() => void) | undefined;
  private readonly onNotification = (): void => this.wake?.();

  constructor(
    private readonly settings: Settings,
    private readonly deliver: () => Promise<void>,
    private readonly listener: Client | undefined,
  ) {}

  async start(): Promise<void> {
    if (this.running) {
      return;
    }
    this.running = true;
    if (this.listener !== undefined) {
      this.listener.on("notification", this.onNotification);
      await this.listener.query("LISTEN outbox_event");
    }
    this.loop = this.run();
  }

  async stop(): Promise<void> {
    this.running = false;
    this.wake?.();
    await this.loop;
    if (this.listener !== undefined) {
      this.listener.off("notification", this.onNotification);
      await this.listener.query("UNLISTEN outbox_event");
    }
  }

  private async run(): Promise<void> {
    while (this.running) {
      await this.deliverSafely();
      await this.waitForWake();
    }
  }

  private async deliverSafely(): Promise<void> {
    try {
      await this.deliver();
    } catch (error) {
      this.settings.errorSink.record(error, { component: "delivery-loop" });
    }
  }

  private waitForWake(): Promise<void> {
    return new Promise((resolve) => {
      const finish = (): void => {
        clearTimeout(timer);
        this.wake = undefined;
        resolve();
      };
      const timer = setTimeout(finish, this.settings.pollIntervalMs);
      this.wake = finish;
    });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
