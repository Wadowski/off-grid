// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

export interface TraceContext {
  readonly traceId: string;
}

const TRACE_ID_PATTERN = /^[A-Za-z0-9-]{1,64}$/;

const storage = new AsyncLocalStorage<TraceContext>();

export function newTraceId(): string {
  return randomUUID();
}

export function isValidTraceId(value: unknown): value is string {
  return typeof value === "string" && TRACE_ID_PATTERN.test(value);
}

/** Keeps a trace id that a caller sent when it is well formed, otherwise starts a new trace. */
export function resolveTraceId(incoming: unknown): string {
  return isValidTraceId(incoming) ? incoming : newTraceId();
}

/** Runs `fn` with `traceId` as the current trace. The id survives awaits and timers started inside `fn`. */
export function runWithTrace<T>(traceId: string, fn: () => T): T {
  if (!isValidTraceId(traceId)) {
    throw new TypeError("trace id must be 1 to 64 letters, digits or hyphens");
  }
  return storage.run({ traceId }, fn);
}

export function currentTraceId(): string | undefined {
  return storage.getStore()?.traceId;
}
