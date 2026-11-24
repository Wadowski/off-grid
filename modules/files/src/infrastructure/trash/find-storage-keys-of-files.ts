// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const findStorageKeysOfFiles = async (
  tx: ModuleTransaction,
  fileIds: readonly string[],
): Promise<string[]> => {
  const rows = await tx.filesFileVersion.findMany({
    where: { fileId: { in: [...fileIds] } },
    select: { storageKey: true },
  });
  return rows.map((row) => row.storageKey);
};
