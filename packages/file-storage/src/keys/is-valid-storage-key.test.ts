// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { isValidStorageKey } from "./is-valid-storage-key.js";

describe("isValidStorageKey", () => {
  it.each([
    ["a".repeat(32), true],
    ["0".repeat(32), true],
    ["A".repeat(32), false],
    ["a".repeat(31), false],
    ["a".repeat(33), false],
    ["../../../../../../etc/passwd0000000", false],
    ["", false],
  ])("returns true only for the generated shape: %j is %s", (key, expected) => {
    expect(isValidStorageKey(key)).toBe(expected);
  });
});
