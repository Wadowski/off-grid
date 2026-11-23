// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { parseRangeHeader } from "./parse-range-header.js";

describe("parseRangeHeader", () => {
  it("reads a closed range inside the file", () => {
    expect(parseRangeHeader("bytes=2-4", 10)).toEqual({ start: 2, end: 4 });
  });

  it("reads an open range to the last byte", () => {
    expect(parseRangeHeader("bytes=4-", 10)).toEqual({ start: 4, end: 9 });
  });

  it("reads a suffix range of the last bytes", () => {
    expect(parseRangeHeader("bytes=-3", 10)).toEqual({ start: 7, end: 9 });
  });

  it("reads a suffix longer than the file as the whole file", () => {
    expect(parseRangeHeader("bytes=-50", 10)).toEqual({ start: 0, end: 9 });
  });

  it("clamps a closed range that ends past the file", () => {
    expect(parseRangeHeader("bytes=8-99", 10)).toEqual({ start: 8, end: 9 });
  });

  it("accepts the unit in any case and surrounding spaces", () => {
    expect(parseRangeHeader("  BYTES=0-0  ", 10)).toEqual({ start: 0, end: 0 });
  });

  it.each([
    ["a range that starts at the size", "bytes=10-", 10],
    ["a range that starts past the size", "bytes=10-20", 10],
    ["a suffix of zero bytes", "bytes=-0", 10],
    ["a suffix of an empty file", "bytes=-5", 0],
    ["a range of an empty file", "bytes=0-", 0],
    ["a start beyond the safe integers", "bytes=9007199254740993-", 10],
  ])("is unsatisfiable for %s", (_, header, size) => {
    expect(parseRangeHeader(header, size)).toBe("unsatisfiable");
  });

  it.each([
    ["no header", undefined],
    ["a multi-range header", "bytes=0-1,3-4"],
    ["another unit", "items=0-1"],
    ["a range whose end is before its start", "bytes=5-2"],
    ["garbage", "bytes=abc"],
    ["an empty range", "bytes=-"],
    ["a missing unit", "0-4"],
    ["a range with a space inside", "bytes=0 - 4"],
  ])("is ignored for %s", (_, header) => {
    expect(parseRangeHeader(header, 10)).toBeNull();
  });
});
