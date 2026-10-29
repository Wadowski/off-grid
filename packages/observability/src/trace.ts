// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

const TRACE_ID_PATTERN = /^[A-Za-z0-9._-]{1,128}$/;

const storage = new AsyncLocalStorage<{ readonly traceId: string }>();

const isValidTraceId = (value: unknown): value is string =>
  typeof value === "string" && TRACE_ID_PATTERN.test(value);

export function resolveTraceId(incoming: unknown): string {
  return isValidTraceId(incoming) ? incoming : randomUUID();
}

export function runWithTrace<T>(traceId: string, fn: () => T): T {
  if (!isValidTraceId(traceId)) {
    throw new TypeError("trace id must be 1 to 128 letters, digits, dots, underscores or hyphens");
  }
  return storage.run({ traceId }, fn);
}

export function currentTraceId(): string | undefined {
  return storage.getStore()?.traceId;
}
