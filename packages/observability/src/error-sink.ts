// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createRedactor } from "./redact.js";
import { currentTraceId } from "./trace.js";
import type { ErrorRecord, ErrorSink, MemoryErrorSinkOptions } from "./types.js";

const DEFAULT_CAPACITY = 200;

const redactContext = createRedactor();

const describeError = (error: unknown): { name: string; code?: string } => {
  if (!(error instanceof Error)) {
    return { name: "NonError" };
  }
  const code: unknown = Reflect.get(error, "code");
  return typeof code === "string" ? { name: error.name, code } : { name: error.name };
};

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
        recorded_at: now().toISOString(),
        ...describeError(error),
        ...traceIdField(),
        context: redactContext(context),
      });
      dropOldest(records, capacity);
    },
    list() {
      return structuredClone(records);
    },
  };
}
