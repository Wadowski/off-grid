// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const REDACTED = "[REDACTED]";

// A key is redacted when its normalised form (lower case, letters and digits only) contains one of these.
// Matching on containment means `accessToken`, `x-auth-token` and `Authorization` are all caught.
const SENSITIVE_WORDS = [
  "password",
  "passwd",
  "secret",
  "token",
  "authorization",
  "cookie",
  "apikey",
  "privatekey",
];

export interface RedactOptions {
  /** Personal field names to redact. These match the whole normalised key, so `name` does not hit `username`. */
  readonly extraKeys?: readonly string[];
  /** Objects nested deeper than this are replaced rather than walked. Defaults to 10. */
  readonly maxDepth?: number;
}

const normalizeKey = (key: string): string => key.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Builds a function that returns a copy of a value with sensitive keys replaced by `[REDACTED]`.
 * Walks plain objects, arrays and errors. The input is never mutated.
 */
export function createRedactor(options: RedactOptions = {}): (value: unknown) => unknown {
  const extraKeys = new Set((options.extraKeys ?? []).map(normalizeKey));
  const maxDepth = options.maxDepth ?? 10;

  const isSensitive = (key: string): boolean => {
    const normalized = normalizeKey(key);
    return extraKeys.has(normalized) || SENSITIVE_WORDS.some((word) => normalized.includes(word));
  };

  const visit = (value: unknown, depth: number, ancestors: Set<object>): unknown => {
    if (value === null || typeof value !== "object") {
      return value;
    }
    if (ancestors.has(value)) {
      return "[Circular]";
    }
    if (depth >= maxDepth) {
      return "[Truncated]";
    }

    ancestors.add(value);
    try {
      if (Array.isArray(value)) {
        return value.map((item: unknown) => visit(item, depth + 1, ancestors));
      }
      const source =
        value instanceof Error ? { ...value, name: value.name, message: value.message } : value;
      return Object.fromEntries(
        Object.entries(source).map(([key, item]) => [
          key,
          isSensitive(key) ? REDACTED : visit(item, depth + 1, ancestors),
        ]),
      );
    } finally {
      ancestors.delete(value);
    }
  };

  return (value) => visit(value, 0, new Set());
}

export function redact(value: unknown, options?: RedactOptions): unknown {
  return createRedactor(options)(value);
}
