// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { FileStorage } from "../../types.js";
import { isPresentInStorage } from "./is-present-in-storage.js";
import { readStoredKeysBatch } from "./read-stored-keys-batch.js";

export const findMissingKeys = async (
  db: ModuleDatabase,
  storage: FileStorage,
  batchSize: number,
): Promise<{ readonly missingKeys: string[]; readonly checkedRowCount: number }> => {
  const missingKeys: string[] = [];
  let checkedRowCount = 0;
  let afterKey: string | undefined;
  let batch = await readStoredKeysBatch(db, afterKey, batchSize);
  while (batch.length > 0) {
    checkedRowCount += batch.length;
    for (const key of batch) {
      if (!(await isPresentInStorage(storage, key))) {
        missingKeys.push(key);
      }
    }
    afterKey = batch[batch.length - 1];
    batch = await readStoredKeysBatch(db, afterKey, batchSize);
  }
  return { missingKeys, checkedRowCount };
};
