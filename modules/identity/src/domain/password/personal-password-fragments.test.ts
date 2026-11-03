// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { personalPasswordFragments } from "./personal-password-fragments.js";

describe("personalPasswordFragments", () => {
  it("returns the lowercase email local part and display name", () => {
    expect(personalPasswordFragments("Anna.Smith@example.com", "Anna Smith")).toEqual([
      "anna.smith",
      "anna smith",
    ]);
  });

  it("drops fragments shorter than three characters so they do not block ordinary passwords", () => {
    expect(personalPasswordFragments("al@example.com", "Bo")).toEqual([]);
  });
});
