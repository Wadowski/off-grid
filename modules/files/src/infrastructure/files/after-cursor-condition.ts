// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NameKeysetCursor } from "../../types.js";

export const afterCursorCondition = (cursor: NameKeysetCursor) => {
  const sameKindAfterName = {
    isFolder: cursor.isFolder,
    OR: [{ name: { gt: cursor.name } }, { name: cursor.name, fileId: { gt: cursor.fileId } }],
  };
  return cursor.isFolder
    ? { OR: [{ isFolder: false }, sameKindAfterName] }
    : { isFolder: false, OR: sameKindAfterName.OR };
};
