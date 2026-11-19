// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { notificationCategorySchema } from "@offgrid/contracts";
import { describe, expect, it } from "vitest";
import { flattenCatalogKeys } from "../test-support/flatten-catalog-keys.js";
import { resolveCatalogKey } from "../test-support/resolve-catalog-key.js";
import { en } from "./catalogs/en.js";

const notificationsCatalogKeys = flattenCatalogKeys(en.notifications, "notifications");

describe("notifications message catalog", () => {
  it.each(notificationsCatalogKeys)("resolves %s to a non-empty string", (key) => {
    const value = resolveCatalogKey(en, key);

    expect(typeof value).toBe("string");
    expect(value).not.toBe("");
  });

  it("has both plural forms of the update count", () => {
    expect(notificationsCatalogKeys).toContain("notifications.updates_one");
    expect(notificationsCatalogKeys).toContain("notifications.updates_other");
  });

  it.each(notificationCategorySchema.options)("has a category label for %s", (category) => {
    expect(resolveCatalogKey(en, `notifications.categories.${category}`)).toEqual(
      expect.any(String),
    );
    expect(resolveCatalogKey(en, `notifications.filters.${category}`)).toEqual(expect.any(String));
  });
});
