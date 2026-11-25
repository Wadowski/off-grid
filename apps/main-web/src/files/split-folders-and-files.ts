// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileListItem, SplitFileEntries } from "./types.js";

export const splitFoldersAndFiles = (items: readonly FileListItem[]): SplitFileEntries => ({
  folders: items.filter((item) => item.isFolder),
  files: items.filter((item) => !item.isFolder),
});
