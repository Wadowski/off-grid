// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const flattenCatalogKeys = (node: Record<string, unknown>, prefix: string): string[] =>
  Object.entries(node).flatMap(([key, value]) =>
    typeof value === "object" && value !== null
      ? flattenCatalogKeys(value as Record<string, unknown>, `${prefix}.${key}`)
      : [`${prefix}.${key}`],
  );
