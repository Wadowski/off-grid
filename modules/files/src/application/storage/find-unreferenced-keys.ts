// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withFilesStorageSweepContext, type ModuleDatabase } from "@offgrid/db";

export const findUnreferencedKeys = (db: ModuleDatabase, keys: readonly string[]): Promise<string[]> =>
  db.$transaction(async (tx) => {
    await withFilesStorageSweepContext(tx);
    const rows = await tx.filesFileVersion.findMany({
      where: { storageKey: { in: [...keys] } },
      select: { storageKey: true },
      distinct: ["storageKey"],
    });
    const referenced = new Set(rows.map((row) => row.storageKey));
    return keys.filter((key) => !referenced.has(key));
  });
