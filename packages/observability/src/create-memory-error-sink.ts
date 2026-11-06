// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { MemoryErrorSinkOptions, ErrorSink, ErrorRecord } from "./types.js";
import { DEFAULT_CAPACITY, DEFAULT_MAX_PENDING_WRITES } from "./constants.js";
import { redactContext } from "./redact-context.js";
import { describeError } from "./describe-error.js";
import { traceIdField } from "./trace-id-field.js";
import { dropOldest } from "./drop-oldest.js";

export const createMemoryErrorSink = (
  options: MemoryErrorSinkOptions = {},
): ErrorSink & { list(): readonly ErrorRecord[] } => {
  const capacity = options.capacity ?? DEFAULT_CAPACITY;
  const now = options.now ?? (() => new Date());
  const maxPendingWrites = options.maxPendingWrites ?? DEFAULT_MAX_PENDING_WRITES;
  const records: ErrorRecord[] = [];
  let pendingWrites = 0;

  const persistRecord = (record: ErrorRecord): void => {
    if (options.persist === undefined || pendingWrites >= maxPendingWrites) {
      return;
    }
    pendingWrites += 1;
    const release = (): void => {
      pendingWrites -= 1;
    };
    Promise.resolve()
      .then(() => options.persist?.(record))
      .then(release, release);
  };

  return {
    record: (error, context = {}) => {
      const record: ErrorRecord = {
        recorded_at: now().toISOString(),
        ...describeError(error),
        ...traceIdField(),
        context: redactContext(context),
      };
      records.push(record);
      dropOldest(records, capacity);
      persistRecord(record);
    },
    list: () => {
      return structuredClone(records);
    },
  };
};
