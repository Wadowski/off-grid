// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { STORAGE_SWEEP_GRACE_MS } from "../../constants.js";
import { hasGracePeriodElapsed } from "../../domain/storage/has-grace-period-elapsed.js";
import type { FileStorage } from "../../types.js";
import { findUnreferencedKeys } from "./find-unreferenced-keys.js";

export const findOrphanKeys = async (
  db: ModuleDatabase,
  storage: FileStorage,
  now: Date,
  batchSize: number,
): Promise<{ readonly orphanKeys: string[]; readonly checkedObjectCount: number }> => {
  const orphanKeys: string[] = [];
  let checkedObjectCount = 0;
  let candidates: string[] = [];
  for await (const entry of storage.listKeys()) {
    checkedObjectCount += 1;
    if (!hasGracePeriodElapsed(entry.modifiedAt, now, STORAGE_SWEEP_GRACE_MS)) {
      continue;
    }
    candidates.push(entry.key);
    if (candidates.length === batchSize) {
      orphanKeys.push(...(await findUnreferencedKeys(db, candidates)));
      candidates = [];
    }
  }
  if (candidates.length > 0) {
    orphanKeys.push(...(await findUnreferencedKeys(db, candidates)));
  }
  return { orphanKeys, checkedObjectCount };
};
