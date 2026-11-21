// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { NOTIFICATION_FILTER_OPTIONS } from "./constants.js";
import { filterForOption } from "./filter-for-option.js";
import { optionForFilters } from "./option-for-filters.js";

describe("optionForFilters", () => {
  it.each(NOTIFICATION_FILTER_OPTIONS)(
    "returns the $id chip for the filters that chip stands for",
    (definition) => {
      expect(optionForFilters(filterForOption(definition.id))).toBe(definition.id);
    },
  );

  it("falls back to the all chip for filters that match no chip", () => {
    expect(optionForFilters({})).toBe("all");
    expect(optionForFilters({ category: "calendar" })).toBe("all");
  });
});
