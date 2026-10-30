// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { RedactOptions } from "./types.js";
import { normalizeKey } from "./normalize-key.js";
import { CIRCULAR, DEFAULT_MAX_DEPTH, REDACTED, TRUNCATED } from "./constants.js";
import { isSensitiveKey } from "./is-sensitive-key.js";
import { isWalkable } from "./is-walkable.js";
import { withErrorFields } from "./with-error-fields.js";

export const createRedactor = (options: RedactOptions = {}): ((value: unknown) => unknown) => {
  const personalKeys = new Set((options.extraKeys ?? []).map(normalizeKey));
  const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;

  const redactEntries = (source: object, depth: number, ancestors: Set<object>) =>
    Object.fromEntries(
      Object.entries(source).map(([key, item]) => [
        key,
        isSensitiveKey(key, personalKeys) ? REDACTED : visit(item, depth + 1, ancestors),
      ]),
    );

  const visit = (value: unknown, depth: number, ancestors: Set<object>): unknown => {
    if (!isWalkable(value)) {
      return value;
    }
    if (ancestors.has(value)) {
      return CIRCULAR;
    }
    if (depth >= maxDepth) {
      return TRUNCATED;
    }

    ancestors.add(value);
    try {
      return Array.isArray(value)
        ? value.map((item: unknown) => visit(item, depth + 1, ancestors))
        : redactEntries(withErrorFields(value), depth, ancestors);
    } finally {
      ancestors.delete(value);
    }
  };

  return (value) => visit(value, 0, new Set());
};
