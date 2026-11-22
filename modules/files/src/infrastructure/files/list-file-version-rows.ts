// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { FileVersionSummary } from "../../types.js";

export const listFileVersionRows = async (
  tx: ModuleTransaction,
  fileId: string,
): Promise<FileVersionSummary[]> => {
  const rows = await tx.filesFileVersion.findMany({
    where: { fileId },
    orderBy: { number: "desc" },
  });
  return rows.map((row) => ({
    versionId: row.versionId,
    fileId: row.fileId,
    number: row.number,
    sizeBytes: row.sizeBytes,
    mimeType: row.mimeType,
    createdByUserId: row.createdByUserId,
    createdAt: row.createdAt,
  }));
};
