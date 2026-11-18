// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withFilesStorageSweepContext, type ModuleDatabase } from "@offgrid/db";

export const readStoredKeysBatch = (
  db: ModuleDatabase,
  afterKey: string | undefined,
  batchSize: number,
): Promise<string[]> =>
  db.$transaction(async (tx) => {
    await withFilesStorageSweepContext(tx);
    const rows = await tx.filesFileVersion.findMany({
      where: afterKey === undefined ? undefined : { storageKey: { gt: afterKey } },
      select: { storageKey: true },
      distinct: ["storageKey"],
      orderBy: { storageKey: "asc" },
      take: batchSize,
    });
    return rows.map((row) => row.storageKey);
  });
