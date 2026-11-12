// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { en } from "./catalogs/en.js";

const flattenKeys = (node: Record<string, unknown>, prefix: string): string[] =>
  Object.entries(node).flatMap(([key, value]) =>
    typeof value === "object" && value !== null
      ? flattenKeys(value as Record<string, unknown>, `${prefix}.${key}`)
      : [`${prefix}.${key}`],
  );

const calendarCatalogKeys = flattenKeys(en.calendar, "calendar");

const resolve = (path: string): unknown =>
  path
    .split(".")
    .reduce<unknown>(
      (node, key) =>
        typeof node === "object" && node !== null
          ? (node as Record<string, unknown>)[key]
          : undefined,
      en,
    );

describe("calendar message catalog", () => {
  it.each(calendarCatalogKeys)("resolves %s to a non-empty string", (key) => {
    const value = resolve(key);

    expect(typeof value).toBe("string");
    expect(value).not.toBe("");
  });
});
