// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { FileVersionRecord } from "../../types.js";

export const findFileVersion = async (
  tx: ModuleTransaction,
  fileId: string,
  versionId: string,
): Promise<FileVersionRecord | null> => {
  const row = await tx.filesFileVersion.findFirst({ where: { fileId, versionId } });
  return row === null
    ? null
    : {
        versionId: row.versionId,
        fileId: row.fileId,
        storageKey: row.storageKey,
        sizeBytes: row.sizeBytes,
        mimeType: row.mimeType,
        sha256: row.sha256,
      };
};
