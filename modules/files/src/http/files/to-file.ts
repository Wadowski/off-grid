// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileRecord } from "../../types.js";
import { toByteSize } from "../../domain/files/to-byte-size.js";

export const toFile = (record: FileRecord) => {
  const entry = {
    id: record.fileId,
    driveId: record.driveId,
    parentId: record.parentId,
    name: record.name,
    version: record.version,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    deletedAt: record.deletedAt === null ? null : record.deletedAt.toISOString(),
  };
  if (record.isFolder) {
    return { ...entry, isFolder: true as const };
  }
  if (record.mimeType === null || record.sizeBytes === null || record.currentVersionId === null) {
    throw new Error("A regular file is missing its metadata");
  }
  return {
    ...entry,
    isFolder: false as const,
    mimeType: record.mimeType,
    size: toByteSize(record.sizeBytes),
    currentVersionId: record.currentVersionId,
  };
};
