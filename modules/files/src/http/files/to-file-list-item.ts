// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileRecord } from "../../types.js";
import { toFile } from "./to-file.js";

export const toFileListItem = (record: FileRecord, itemCounts: ReadonlyMap<string, number>) => {
  const file = toFile(record);
  if (file.isFolder) {
    return { ...file, itemCount: itemCounts.get(record.fileId) ?? 0 };
  }
  return file;
};
