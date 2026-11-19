// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { requireFamilyId } from "./require-family-id.js";

describe("requireFamilyId", () => {
  it("returns the family id when there is one", () => {
    expect(requireFamilyId("8f3c2a7e-1d4b-4e6a-9b2c-5d7e8f9a0b1c")).toBe(
      "8f3c2a7e-1d4b-4e6a-9b2c-5d7e8f9a0b1c",
    );
  });

  it("refuses a membership event that has no family", () => {
    expect(() => requireFamilyId(null)).toThrow("family membership event has no family");
  });
});
