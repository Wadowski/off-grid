// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { formatFileSize } from "./format-file-size.js";

describe("formatFileSize", () => {
  it.each([
    [0, "0 B"],
    [1, "1 B"],
    [999, "999 B"],
    [1000, "1.0 KB"],
    [1536, "1.5 KB"],
    [2_800_000, "2.8 MB"],
    [18_400_000, "18.4 MB"],
    [3_200_000_000, "3.2 GB"],
  ])("writes %d bytes as %s", (bytes, expected) => {
    expect(formatFileSize(bytes, "en")).toBe(expected);
  });

  it("moves to the next unit when rounding reaches 1000", () => {
    expect(formatFileSize(999_960, "en")).toBe("1.0 MB");
  });

  it("stays in gigabytes for very large sizes", () => {
    expect(formatFileSize(5_000_000_000_000, "en")).toBe("5,000.0 GB");
  });

  it("uses the decimal separator of the locale", () => {
    expect(formatFileSize(2_800_000, "pl")).toBe("2,8 MB");
  });

  it.each([-5, Number.NaN, Number.POSITIVE_INFINITY])("writes %s as 0 B", (bytes) => {
    expect(formatFileSize(bytes, "en")).toBe("0 B");
  });
});
