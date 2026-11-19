// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { notificationCategorySchema, notificationTypeSchema } from "@offgrid/contracts";
import { describe, expect, it } from "vitest";
import { en } from "./catalogs/en.js";

const flattenKeys = (node: Record<string, unknown>, prefix: string): string[] =>
  Object.entries(node).flatMap(([key, value]) =>
    typeof value === "object" && value !== null
      ? flattenKeys(value as Record<string, unknown>, `${prefix}.${key}`)
      : [`${prefix}.${key}`],
  );

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

const notificationsCatalogKeys = flattenKeys(en.notifications, "notifications");

describe("notifications message catalog", () => {
  it.each(notificationsCatalogKeys)("resolves %s to a non-empty string", (key) => {
    const value = resolve(key);

    expect(typeof value).toBe("string");
    expect(value).not.toBe("");
  });

  it("has both plural forms of the update count", () => {
    expect(notificationsCatalogKeys).toContain("notifications.updates_one");
    expect(notificationsCatalogKeys).toContain("notifications.updates_other");
  });

  it.each(notificationCategorySchema.options)("has a category label for %s", (category) => {
    expect(resolve(`notifications.categories.${category}`)).toEqual(expect.any(String));
    expect(resolve(`notifications.filters.${category}`)).toEqual(expect.any(String));
  });

  it.each(notificationTypeSchema.options)("has a title and body for %s", (type) => {
    expect(resolve(`notifications.types.${type}.title`)).toEqual(expect.any(String));
    expect(resolve(`notifications.types.${type}.body`)).toEqual(expect.any(String));
  });

  it("has the card action and state labels", () => {
    expect(resolve("notifications.actions.viewEvent")).toEqual(expect.any(String));
    expect(resolve("notifications.card.unread")).toEqual(expect.any(String));
    expect(resolve("notifications.card.read")).toEqual(expect.any(String));
    expect(resolve("notifications.card.nameWithState")).toEqual(expect.any(String));
  });
});
