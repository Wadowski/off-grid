// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { validateFamilyName } from "./validate-family-name.js";

describe("validateFamilyName", () => {
  it("accepts a name within the contract limits", () => {
    expect(validateFamilyName("Lakeside")).toBeUndefined();
  });

  it("requires a name that is not blank", () => {
    expect(validateFamilyName("")).toBe("families.nameRequired");
    expect(validateFamilyName("   ")).toBe("families.nameRequired");
  });

  it("rejects names longer than 100 characters", () => {
    expect(validateFamilyName("a".repeat(101))).toBe("families.nameTooLong");
  });
});
