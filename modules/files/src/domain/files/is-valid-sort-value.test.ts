// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { isValidSortValue } from "./is-valid-sort-value.js";

describe("isValidSortValue", () => {
  it("accepts a size that fits a signed 64-bit integer", () => {
    expect(isValidSortValue("sizeBytes", "0")).toBe(true);
    expect(isValidSortValue("sizeBytes", "9223372036854775807")).toBe(true);
  });

  it("rejects a size above the signed 64-bit maximum", () => {
    expect(isValidSortValue("sizeBytes", "9223372036854775808")).toBe(false);
    expect(isValidSortValue("sizeBytes", "9".repeat(255))).toBe(false);
  });

  it("rejects a size that is not digits", () => {
    expect(isValidSortValue("sizeBytes", "-1")).toBe(false);
    expect(isValidSortValue("sizeBytes", "1.5")).toBe(false);
  });
});
