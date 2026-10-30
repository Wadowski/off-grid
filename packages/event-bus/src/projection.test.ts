// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { classifySourceVersion } from "./classify-source-version.js";

describe("classifySourceVersion", () => {
  it("applies the first event of a stream at version 1", () => {
    expect(classifySourceVersion(null, 1)).toBe("apply");
  });

  it("reports a first event beyond version 1 as a gap", () => {
    expect(classifySourceVersion(null, 3)).toBe("gap");
  });

  it("applies the next version in sequence", () => {
    expect(classifySourceVersion(4, 5)).toBe("apply");
  });

  it("ignores a repeat of the stored version", () => {
    expect(classifySourceVersion(4, 4)).toBe("duplicate");
  });

  it("ignores an older version", () => {
    expect(classifySourceVersion(4, 2)).toBe("stale");
  });

  it("reports a jump past the next version as a gap", () => {
    expect(classifySourceVersion(4, 7)).toBe("gap");
  });
});
