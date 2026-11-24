// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ChildrenCursor, NameKeysetCursor } from "../../types.js";

export const toNameKeysetCursor = (cursor: ChildrenCursor): NameKeysetCursor => ({
  isFolder: cursor.isFolder,
  name: cursor.sortValue,
  fileId: cursor.fileId,
});
