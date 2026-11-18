// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { resolveByteRange } from "./resolve-byte-range.js";

describe("resolveByteRange", () => {
  it("resolves an inclusive range inside the object", () => {
    expect(resolveByteRange(10, 2, 4)).toEqual({ start: 2, length: 3 });
  });

  it("resolves the first and the last byte", () => {
    expect(resolveByteRange(10, 0, 0)).toEqual({ start: 0, length: 1 });
    expect(resolveByteRange(10, 9, 9)).toEqual({ start: 9, length: 1 });
  });

  it.each([
    ["starts past the end", 10, 10, 10],
    ["ends past the end", 10, 0, 10],
    ["ends before it starts", 10, 5, 4],
    ["starts negative", 10, -1, 3],
    ["is not a whole number", 10, 1.5, 3],
    ["is read from an empty object", 0, 0, 0],
  ])("returns null when the range %s", (_, size, start, end) => {
    expect(resolveByteRange(size, start, end)).toBeNull();
  });
});
