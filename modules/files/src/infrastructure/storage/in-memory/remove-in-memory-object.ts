// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { assertValidStorageKey } from "../../../application/storage/assert-valid-storage-key.js";

export const removeInMemoryObject = async (
  objects: Map<string, Buffer>,
  key: string,
): Promise<void> => {
  assertValidStorageKey(key);
  objects.delete(key);
};
