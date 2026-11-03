// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { normalizeResetCode } from "./normalize-reset-code.js";

describe("normalizeResetCode", () => {
  it("ignores dashes, spaces and letter case", () => {
    expect(normalizeResetCode(" abcd-2efg hjkl ")).toBe("ABCD2EFGHJKL");
  });
});
