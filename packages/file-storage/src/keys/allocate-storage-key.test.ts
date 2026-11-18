// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { StorageKeyAllocationError } from "../errors/storage-key-allocation-error.js";
import { allocateStorageKey } from "./allocate-storage-key.js";

describe("allocateStorageKey", () => {
  it("returns the first generated key that is free", async () => {
    const key = await allocateStorageKey(async () => false);
    expect(key).toMatch(/^[0-9a-f]{32}$/);
  });

  it("gives up after a few taken keys", async () => {
    await expect(allocateStorageKey(async () => true)).rejects.toThrow(StorageKeyAllocationError);
  });
});
