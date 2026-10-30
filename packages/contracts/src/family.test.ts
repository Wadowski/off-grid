// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { createFamilyRequestSchema } from "./create-family-request-schema.js";
import { familyNameSchema } from "./family-name-schema.js";

describe("familyNameSchema", () => {
  it("keeps a name of 1 to 100 characters, without surrounding spaces", () => {
    expect(familyNameSchema.parse("  Novak family  ")).toBe("Novak family");
  });

  it("accepts a name of exactly 100 characters", () => {
    const name = "a".repeat(100);

    expect(familyNameSchema.parse(name)).toBe(name);
  });

  it("rejects a name that is only spaces", () => {
    expect(familyNameSchema.safeParse("   ").success).toBe(false);
  });

  it("rejects a name longer than 100 characters", () => {
    expect(familyNameSchema.safeParse("a".repeat(101)).success).toBe(false);
  });
});

describe("createFamilyRequestSchema", () => {
  it("rejects a body without a name", () => {
    expect(createFamilyRequestSchema.safeParse({}).success).toBe(false);
  });
});
