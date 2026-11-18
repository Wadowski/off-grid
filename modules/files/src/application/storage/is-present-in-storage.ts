// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { isValidStorageKey } from "../../domain/storage/is-valid-storage-key.js";
import type { FileStorage } from "../../types.js";

export const isPresentInStorage = (storage: FileStorage, key: string): Promise<boolean> =>
  isValidStorageKey(key) ? storage.exists(key) : Promise.resolve(false);
