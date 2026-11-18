// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { StorageRangeNotSatisfiableError } from "../errors/storage-range-not-satisfiable-error.js";
import { resolveRequestedRange } from "./resolve-requested-range.js";

describe("resolveRequestedRange", () => {
  it("reads the whole object when no range is given, including an empty one", () => {
    expect(resolveRequestedRange(7, undefined)).toEqual({ start: 0, length: 7 });
    expect(resolveRequestedRange(0, undefined)).toEqual({ start: 0, length: 0 });
  });

  it("treats a missing end as the last byte", () => {
    expect(resolveRequestedRange(10, { start: 4 })).toEqual({ start: 4, length: 6 });
  });

  it("rejects a range the object cannot satisfy", () => {
    expect(() => resolveRequestedRange(10, { start: 10 })).toThrow(StorageRangeNotSatisfiableError);
    expect(() => resolveRequestedRange(0, { start: 0 })).toThrow(StorageRangeNotSatisfiableError);
  });
});
