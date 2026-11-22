// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileKindFromMimeType } from "@offgrid/ui";
import type { FileListItem, FileRowValues } from "./types.js";

export const toFileRowValues = (item: FileListItem): FileRowValues => {
  const modifiedAt = new Date(item.updatedAt);
  if (item.isFolder) {
    return { name: item.name, kind: "folder", modifiedAt, itemCount: item.itemCount };
  }
  return {
    name: item.name,
    kind: fileKindFromMimeType(item.mimeType, false),
    modifiedAt,
    sizeBytes: item.size,
  };
};
