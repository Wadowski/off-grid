// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AnyEventDefinition } from "@offgrid/contracts";
import type { ErrorSink } from "@offgrid/observability";
import type { Client, ClientBase, Pool } from "pg";

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

export interface DeliverySettings {
  readonly pool: Pool;
  readonly errorSink: ErrorSink;
  readonly maxAttempts: number;
  readonly retryDelayMs: (attempt: number) => number;
  readonly batchSize: number;
  readonly pollIntervalMs: number;
}

export interface ReplayOptions {
  readonly pool: Pool;
  readonly fromSequence?: number;
  readonly batchSize?: number;
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
