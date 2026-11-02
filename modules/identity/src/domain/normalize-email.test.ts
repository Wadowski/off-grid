// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { normalizeEmail } from "./normalize-email.js";

describe("normalizeEmail", () => {
  it("trims and lowercases so lookups ignore case", () => {
    expect(normalizeEmail("  Anna@Example.COM ")).toBe("anna@example.com");
  });
});
