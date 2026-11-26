// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileListItem } from "./types.js";

export const toRenameSelectionEnd = (entry: FileListItem): number => {
  if (entry.isFolder) {
    return entry.name.length;
  }
  const extensionDotIndex = entry.name.lastIndexOf(".");
  return extensionDotIndex > 0 ? extensionDotIndex : entry.name.length;
};
