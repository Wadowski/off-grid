// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createRedactor } from "./redact.js";
import { currentTraceId } from "./trace.js";

const DEFAULT_CAPACITY = 200;

export interface ErrorRecord {
  readonly recordedAt: string;
  readonly name: string;
  readonly message: string;
  readonly trace_id?: string;
  readonly context: Record<string, unknown>;
}

export interface ErrorSink {
  record(error: unknown, context?: Record<string, unknown>): void;
}

interface MemoryErrorSinkOptions {
  readonly capacity?: number;
  readonly now?: () => Date;
}

const redactContext = createRedactor();

const describeError = (error: unknown): { name: string; message: string } =>
  error instanceof Error
    ? { name: error.name, message: error.message }
    : { name: "NonError", message: String(error) };

const traceIdField = (): { trace_id?: string } => {
  const traceId = currentTraceId();
  return traceId === undefined ? {} : { trace_id: traceId };
};

const dropOldest = (records: ErrorRecord[], capacity: number): void => {
  if (records.length > capacity) {
    records.splice(0, records.length - capacity);
  }
};

export function createMemoryErrorSink(
  options: MemoryErrorSinkOptions = {},
): ErrorSink & { list(): readonly ErrorRecord[] } {
  const capacity = options.capacity ?? DEFAULT_CAPACITY;
  const now = options.now ?? (() => new Date());
  const records: ErrorRecord[] = [];

  return {
    record(error, context = {}) {
      records.push({
        recordedAt: now().toISOString(),
        ...describeError(error),
        ...traceIdField(),
        context: redactContext(context) as Record<string, unknown>,
      });
      dropOldest(records, capacity);
    },
    list() {
      return [...records];
    },
  };
}
