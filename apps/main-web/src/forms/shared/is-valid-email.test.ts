// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { isValidEmail } from "./is-valid-email.js";

describe("isValidEmail", () => {
  it("accepts an email address", () => {
    expect(isValidEmail("anna@example.com")).toBe(true);
  });

  it("rejects text that is not an email address", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
  });

  it("rejects an address longer than 254 characters", () => {
    expect(isValidEmail(`${"a".repeat(245)}@example.com`)).toBe(false);
  });
});
