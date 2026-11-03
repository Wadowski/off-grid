// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { requireOption } from "./require-option.js";

describe("requireOption", () => {
  it("returns the value when the option was given", () => {
    expect(requireOption("anna@example.com", "--email")).toBe("anna@example.com");
  });

  it("names the missing flag and shows the usage", () => {
    expect(() => requireOption(undefined, "--email")).toThrow("--email is required");
    expect(() => requireOption("", "--email")).toThrow("Usage:");
  });
});
