// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { optionForFilters } from "./option-for-filters.js";

describe("optionForFilters", () => {
  it("returns the chip that matches the inbox filters", () => {
    expect(optionForFilters({ unread: false })).toBe("all");
    expect(optionForFilters({})).toBe("all");
    expect(optionForFilters({ unread: true })).toBe("unread");
    expect(optionForFilters({ category: "calendar", unread: false })).toBe("calendar");
    expect(optionForFilters({ category: "account-security", unread: false })).toBe(
      "account-security",
    );
  });
});
