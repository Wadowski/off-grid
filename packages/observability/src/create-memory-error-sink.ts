// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { MemoryErrorSinkOptions, ErrorSink, ErrorRecord } from "./types.js";
import { DEFAULT_CAPACITY } from "./constants.js";
import { redactContext } from "./redact-context.js";
import { describeError } from "./describe-error.js";
import { traceIdField } from "./trace-id-field.js";
import { dropOldest } from "./drop-oldest.js";

export const createMemoryErrorSink = (
  options: MemoryErrorSinkOptions = {},
): ErrorSink & { list(): readonly ErrorRecord[] } => {
  const capacity = options.capacity ?? DEFAULT_CAPACITY;
  const now = options.now ?? (() => new Date());
  const records: ErrorRecord[] = [];

  return {
    record: (error, context = {}) => {
      records.push({
        recorded_at: now().toISOString(),
        ...describeError(error),
        ...traceIdField(),
        context: redactContext(context),
      });
      dropOldest(records, capacity);
    },
    list: () => {
      return structuredClone(records);
    },
  };
};
