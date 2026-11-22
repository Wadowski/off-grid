// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { isBellCountOverflowing } from "./is-bell-count-overflowing.js";

describe("isBellCountOverflowing", () => {
  it.each([
    [0, false],
    [1, false],
    [99, false],
    [100, true],
    [120, true],
  ])("is %s unread overflowing: %s", (count, expected) => {
    expect(isBellCountOverflowing(count)).toBe(expected);
  });
});
