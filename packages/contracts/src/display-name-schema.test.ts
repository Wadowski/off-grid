// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { displayNameSchema } from "./display-name-schema.js";

describe("displayNameSchema", () => {
  it("trims surrounding spaces", () => {
    expect(displayNameSchema.parse("  Ada  ")).toBe("Ada");
  });

  it("rejects a blank name", () => {
    expect(displayNameSchema.safeParse("   ").success).toBe(false);
  });

  it("accepts 100 characters and rejects 101", () => {
    expect(displayNameSchema.safeParse("a".repeat(100)).success).toBe(true);
    expect(displayNameSchema.safeParse("a".repeat(101)).success).toBe(false);
  });
});
