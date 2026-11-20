// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileStorage } from "@offgrid/file-storage";

export const deleteStoredBytes = async (
  storage: FileStorage,
  storageKeys: readonly string[],
): Promise<void> => {
  for (const storageKey of storageKeys) {
    await storage.delete(storageKey).catch(() => undefined);
  }
};
