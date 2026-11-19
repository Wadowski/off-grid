// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { FileVersionRecord } from "../../types.js";

export const findFileVersions = async (
  tx: ModuleTransaction,
  fileIds: readonly string[],
): Promise<FileVersionRecord[]> => {
  const rows = await tx.filesFileVersion.findMany({ where: { fileId: { in: [...fileIds] } } });
  return rows.map((row) => ({
    versionId: row.versionId,
    fileId: row.fileId,
    storageKey: row.storageKey,
    sizeBytes: row.sizeBytes,
    mimeType: row.mimeType,
    sha256: row.sha256,
  }));
};
