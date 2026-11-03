// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { RESET_CODE_ALPHABET } from "../../constants.js";
import { generateResetCode } from "./generate-reset-code.js";

describe("generateResetCode", () => {
  it("returns three groups of four characters from the readable alphabet", () => {
    const code = generateResetCode();

    expect(code).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    for (const character of code.replace(/-/g, "")) {
      expect(RESET_CODE_ALPHABET).toContain(character);
    }
  });

  it("does not repeat across calls", () => {
    const codes = new Set(Array.from({ length: 50 }, generateResetCode));

    expect(codes.size).toBe(50);
  });
});
