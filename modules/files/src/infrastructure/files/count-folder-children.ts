// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const countFolderChildren = async (
  tx: ModuleTransaction,
  input: {
    readonly driveId: string;
    readonly folderIds: readonly string[];
  },
): Promise<Map<string, number>> => {
  const counts = new Map(input.folderIds.map((folderId) => [folderId, 0]));
  if (input.folderIds.length === 0) {
    return counts;
  }
  const groups = await tx.filesFile.groupBy({
    by: ["parentId"],
    where: {
      driveId: input.driveId,
      parentId: { in: [...input.folderIds] },
      deletedAt: null,
    },
    _count: { _all: true },
  });
  for (const group of groups) {
    if (group.parentId !== null) {
      counts.set(group.parentId, group._count._all);
    }
  }
  return counts;
};
