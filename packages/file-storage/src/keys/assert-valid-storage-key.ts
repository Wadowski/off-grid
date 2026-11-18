// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { isValidStorageKey } from "./is-valid-storage-key.js";
import { StorageKeyInvalidError } from "../errors/storage-key-invalid-error.js";

export const assertValidStorageKey = (key: string): void => {
  if (!isValidStorageKey(key)) {
    throw new StorageKeyInvalidError();
  }
};
