// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileRecord } from "../../types.js";

export const toFileRecord = (row: {
  fileId: string;
  driveId: string;
  parentId: string | null;
  name: string;
  isFolder: boolean;
  mimeType: string | null;
  sizeBytes: bigint | null;
  currentVersionId: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): FileRecord => ({
  fileId: row.fileId,
  driveId: row.driveId,
  parentId: row.parentId,
  name: row.name,
  isFolder: row.isFolder,
  mimeType: row.mimeType,
  sizeBytes: row.sizeBytes,
  currentVersionId: row.currentVersionId,
  version: row.version,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  deletedAt: row.deletedAt,
});
