// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AnyEventDefinition } from "@offgrid/contracts";
import type { ErrorSink } from "@offgrid/observability";
import type { Client, ClientBase, Pool } from "pg";

export type EventOf<D extends AnyEventDefinition> = ReturnType<D["envelope"]["parse"]>;

export interface HandlerContext {
  readonly tx: ClientBase;
}

// "skip" dead-letters an event after its attempts run out and moves on. "halt" stops
// the subscriber at that event and retries it on later passes, so no later event is
// applied past it. Use "halt" for projections whose state must not drift.
export type FailurePolicy = "skip" | "halt";

export interface Subscription<D extends AnyEventDefinition = AnyEventDefinition> {
  readonly name: string;
  readonly event: D;
  readonly runAs: string;
  readonly onFailure?: FailurePolicy;
  handler(event: EventOf<D>, context: HandlerContext): Promise<void>;
}

// One cursor for several event types, so the handler sees them in publish order.
export interface MultiEventSubscription<Ds extends readonly AnyEventDefinition[]> {
  readonly name: string;
  readonly events: Ds;
  readonly runAs: string;
  readonly onFailure?: FailurePolicy;
  handler(event: EventOf<Ds[number]>, context: HandlerContext): Promise<void>;
}

// What the delivery code works on: every subscription, single or multi, in one shape.
export interface Delivery {
  readonly name: string;
  readonly events: readonly AnyEventDefinition[];
  readonly runAs: string;
  readonly onFailure: FailurePolicy;
  handler(event: EventOf<AnyEventDefinition>, context: HandlerContext): Promise<void>;
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
  subscribeToEvents<const Ds extends readonly AnyEventDefinition[]>(
    subscription: MultiEventSubscription<Ds>,
  ): void;
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

export interface DeliverySettings {
  readonly pool: Pool;
  readonly errorSink: ErrorSink;
  readonly maxAttempts: number;
  readonly retryDelayMs: (attempt: number) => number;
  readonly batchSize: number;
  readonly pollIntervalMs: number;
}

export interface ReplayOptions extends Pick<EventBusOptions, "pool"> {
  readonly fromSequence?: number;
  readonly batchSize?: number;
}

export interface SqlExecutor {
  query<Row = unknown>(text: string, values?: unknown[]): Promise<{ rows: Row[] }>;
}

export interface PublishOptions {
  readonly userId?: string;
}

export interface StoredEvent {
  readonly sequence: number;
  readonly id: string;
  readonly type: string;
  readonly version: number;
  readonly sourceVersion: number;
  readonly traceId: string;
  readonly occurredAt: string;
  readonly familyId: string | null;
  readonly payload: unknown;
}

export interface EventRow {
  readonly sequence: string;
  readonly id: string;
  readonly type: string;
  readonly version: number;
  readonly source_version: string;
  readonly trace_id: string;
  readonly occurred_at: Date;
  readonly family_id: string | null;
  readonly payload: unknown;
}

export interface NewEvent {
  readonly id: string;
  readonly type: string;
  readonly version: number;
  readonly sourceVersion: number;
  readonly traceId: string;
  readonly occurredAt: string;
  readonly familyId: string | null;
  readonly userId: string | null;
  readonly payload: unknown;
}

export type SourceVersionDecision = "apply" | "duplicate" | "stale" | "gap";

export type Deliver = () => Promise<void>;

export type OnNotification = () => void;

export interface DeliveryLoopState {
  running: boolean;
  loop: Promise<void> | undefined;
  wake: OnNotification | undefined;
}

export interface DeliveryLoop {
  start(): Promise<void>;
  stop(): Promise<void>;
}
