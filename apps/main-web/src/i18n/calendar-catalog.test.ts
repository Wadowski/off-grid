// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { en } from "./catalogs/en.js";
import { flattenCatalogKeys } from "../test-support/flatten-catalog-keys.js";
import { resolveCatalogKey } from "../test-support/resolve-catalog-key.js";

const calendarCatalogKeys = flattenCatalogKeys(en.calendar, "calendar");

describe("calendar message catalog", () => {
  it.each(calendarCatalogKeys)("resolves %s to a non-empty string", (key) => {
    const value = resolveCatalogKey(en, key);

    expect(typeof value).toBe("string");
    expect(value).not.toBe("");
  });
});
