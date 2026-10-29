// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createRedactor } from "./redact.js";
import { currentTraceId } from "./trace.js";

export interface ErrorRecord {
  readonly recordedAt: string;
  readonly name: string;
  readonly message: string;
  readonly trace_id?: string;
  readonly context: Record<string, unknown>;
}

/** Receives errors that should be visible to the instance admin. Implementations must not throw. */
export interface ErrorSink {
  record(error: unknown, context?: Record<string, unknown>): void;
}

export interface MemoryErrorSinkOptions {
  /** Number of most recent errors kept. Older ones are dropped. Defaults to 200. */
  readonly capacity?: number;
  readonly now?: () => Date;
}

export interface MemoryErrorSink extends ErrorSink {
  /** Returns the stored errors, oldest first. */
  list(): readonly ErrorRecord[];
}

const redactContext = createRedactor();

/**
 * In-process error log with a fixed capacity. It keeps errors in memory only, so nothing leaves the
 * machine. The event bus feeds it from the dead-letter queue, and the admin error log reads it.
 */
export function createMemoryErrorSink(options: MemoryErrorSinkOptions = {}): MemoryErrorSink {
  const capacity = options.capacity ?? 200;
  const now = options.now ?? (() => new Date());
  const records: ErrorRecord[] = [];

  return {
    record(error, context = {}) {
      const isError = error instanceof Error;
      const trace_id = currentTraceId();
      records.push({
        recordedAt: now().toISOString(),
        name: isError ? error.name : "NonError",
        message: isError ? error.message : String(error),
        ...(trace_id === undefined ? {} : { trace_id }),
        context: redactContext(context) as Record<string, unknown>,
      });
      if (records.length > capacity) {
        records.splice(0, records.length - capacity);
      }
    },
    list() {
      return [...records];
    },
  };
}
