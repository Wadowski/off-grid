// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const findTrashedFileIds = async (
  tx: ModuleTransaction,
  driveId: string,
): Promise<string[]> => {
  const rows = await tx.filesFile.findMany({
    where: { driveId, deletedAt: { not: null } },
    select: { fileId: true },
    orderBy: { fileId: "asc" },
  });
  return rows.map((row) => row.fileId);
};
