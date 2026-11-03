// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { findPasswordStrengthTextId } from "./find-password-strength-text-id.js";

describe("findPasswordStrengthTextId", () => {
  it("shows nothing before anything is typed", () => {
    expect(findPasswordStrengthTextId("")).toBeUndefined();
  });

  it("says a password under 12 characters is too weak", () => {
    expect(findPasswordStrengthTextId("short")).toBe("createAccount.strength.tooWeak");
  });

  it("accepts a password of 12 characters", () => {
    expect(findPasswordStrengthTextId("abcdefghijkl")).toBe("createAccount.strength.strong");
  });
});
