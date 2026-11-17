// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { roundToOneDecimal } from "./round-to-one-decimal.js";

describe("roundToOneDecimal", () => {
  it.each([
    [1.24, 1.2],
    [1.26, 1.3],
    [3, 3],
  ])("rounds  to ", (value, expected) => {
    expect(roundToOneDecimal(value)).toBe(expected);
  });
});
