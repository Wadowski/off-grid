// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const findSiblingNamesWithStem = async (
  tx: ModuleTransaction,
  input: {
    readonly driveId: string;
    readonly parentId: string | null;
    readonly stem: string;
  },
): Promise<string[]> => {
  const rows = await tx.filesFile.findMany({
    where: {
      driveId: input.driveId,
      parentId: input.parentId,
      deletedAt: null,
      name: { startsWith: input.stem, mode: "insensitive" },
    },
    select: { name: true },
  });
  return rows.map((row) => row.name);
};
