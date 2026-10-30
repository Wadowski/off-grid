// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { InvalidFamilyNameError, parseFamilyName } from "./family.js";

describe("parseFamilyName", () => {
  it("keeps a name of 1 to 100 characters, without surrounding spaces", () => {
    expect(parseFamilyName("  Novak family  ")).toBe("Novak family");
  });

  it("accepts a name of exactly 100 characters", () => {
    const name = "a".repeat(100);

    expect(parseFamilyName(name)).toBe(name);
  });

  it("rejects an empty name", () => {
    expect(() => parseFamilyName("   ")).toThrow(InvalidFamilyNameError);
  });

  it("rejects a name longer than 100 characters", () => {
    expect(() => parseFamilyName("a".repeat(101))).toThrow(InvalidFamilyNameError);
  });
});
