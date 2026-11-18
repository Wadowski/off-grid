// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { isValidStorageKey } from "./is-valid-storage-key.js";
import { generateStorageKey } from "./generate-storage-key.js";

describe("generateStorageKey", () => {
  it("returns a valid 32 character lowercase hex key", () => {
    expect(isValidStorageKey(generateStorageKey())).toBe(true);
  });

  it("returns a different key on each call", () => {
    const keys = new Set(Array.from({ length: 500 }, () => generateStorageKey()));
    expect(keys.size).toBe(500);
  });
});
