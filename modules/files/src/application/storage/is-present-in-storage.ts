// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { isValidStorageKey } from "@offgrid/file-storage";
import type { FileStorage } from "@offgrid/file-storage";

export const isPresentInStorage = (storage: FileStorage, key: string): Promise<boolean> =>
  isValidStorageKey(key) ? storage.exists(key) : Promise.resolve(false);
