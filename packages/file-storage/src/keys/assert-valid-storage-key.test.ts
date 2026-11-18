// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { StorageKeyInvalidError } from "../errors/storage-key-invalid-error.js";
import { assertValidStorageKey } from "./assert-valid-storage-key.js";

const VALID_KEY = "a".repeat(32);

const REJECTED_KEYS = [
  "",
  `../${"a".repeat(31)}`,
  "/etc/passwd",
  "a/b",
  "..",
  `${"a".repeat(31)}\0`,
  "A".repeat(32),
  "a".repeat(31),
  "a".repeat(33),
  `${"a".repeat(31)}é`,
  `${"a".repeat(32)}\n`,
  `${"a".repeat(32)}/`,
];

describe("assertValidStorageKey", () => {
  it("accepts a generated shape key", () => {
    expect(() => assertValidStorageKey(VALID_KEY)).not.toThrow();
  });

  it.each(REJECTED_KEYS)("rejects %j with StorageKeyInvalidError", (key) => {
    expect(() => assertValidStorageKey(key)).toThrow(StorageKeyInvalidError);
  });
});
