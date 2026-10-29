// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

const REDACTED = "[REDACTED]";
const CIRCULAR = "[Circular]";
const TRUNCATED = "[Truncated]";
const DEFAULT_MAX_DEPTH = 10;

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
  readonly extraKeys?: readonly string[];
  readonly maxDepth?: number;
}

const normalizeKey = (key: string): string => key.toLowerCase().replace(/[^a-z0-9]/g, "");

const isSensitiveKey = (key: string, personalKeys: ReadonlySet<string>): boolean => {
  const normalized = normalizeKey(key);
  return personalKeys.has(normalized) || SENSITIVE_WORDS.some((word) => normalized.includes(word));
};

const isWalkable = (value: unknown): value is object =>
  value !== null && typeof value === "object" && !(value instanceof Date);

const withErrorFields = (value: object): object =>
  value instanceof Error ? { ...value, name: value.name, message: value.message } : value;

export function createRedactor(options: RedactOptions = {}): (value: unknown) => unknown {
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
}
