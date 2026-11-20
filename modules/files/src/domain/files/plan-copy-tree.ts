// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CopyPlanEntry, FileRecord } from "../../types.js";

export const planCopyTree = (
  entries: readonly FileRecord[],
  targetParentId: string | null,
  createId: () => string,
): CopyPlanEntry[] => {
  const copyIds = new Map<string, string>();
  return entries.map((entry) => {
    const copyFileId = createId();
    copyIds.set(entry.fileId, copyFileId);
    const copyParentId =
      entry.parentId === null || !copyIds.has(entry.parentId)
        ? targetParentId
        : (copyIds.get(entry.parentId) ?? targetParentId);
    return { sourceFileId: entry.fileId, copyFileId, copyParentId };
  });
};
