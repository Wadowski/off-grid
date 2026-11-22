// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileVersionSummary } from "../../types.js";
import { toByteSize } from "./to-byte-size.js";

export const toFileVersion = (record: FileVersionSummary) => ({
  id: record.versionId,
  fileId: record.fileId,
  number: record.number,
  size: toByteSize(record.sizeBytes),
  mimeType: record.mimeType,
  createdByUserId: record.createdByUserId,
  createdAt: record.createdAt.toISOString(),
});
