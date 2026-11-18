// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { STORAGE_KEY_GENERATION_ATTEMPTS } from "../constants.js";
import { StorageKeyAllocationError } from "../errors/storage-key-allocation-error.js";
import { generateStorageKey } from "./generate-storage-key.js";

export const allocateStorageKey = async (
  isTaken: (key: string) => Promise<boolean>,
): Promise<string> => {
  for (let attempt = 0; attempt < STORAGE_KEY_GENERATION_ATTEMPTS; attempt += 1) {
    const key = generateStorageKey();
    if (!(await isTaken(key))) {
      return key;
    }
  }
  throw new StorageKeyAllocationError();
};
