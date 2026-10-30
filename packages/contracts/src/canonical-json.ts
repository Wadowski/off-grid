// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const canonicalJson = (value: unknown): string => {
  return JSON.stringify(value, (_key, nested: unknown) => {
    if (typeof nested !== "object" || nested === null || Array.isArray(nested)) {
      return nested;
    }
    return Object.fromEntries(Object.entries(nested).sort(([a], [b]) => (a < b ? -1 : 1)));
  });
};
