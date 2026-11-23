// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { ExpiredRoot, ExpiredRootCursor } from "../../types.js";
import { toExpiredRoot } from "./to-expired-root.js";

export const findExpiredTrashedRoots = async (
  tx: ModuleTransaction,
  input: {
    readonly cutoff: Date;
    readonly after: ExpiredRootCursor | null;
    readonly take: number;
  },
): Promise<ExpiredRoot[]> => {
  const rows = await tx.filesFile.findMany({
    where: {
      deletedAt: { lt: input.cutoff },
      ...(input.after === null
        ? {}
        : {
            OR: [
              { deletedAt: { gt: input.after.deletedAt } },
              { deletedAt: input.after.deletedAt, fileId: { gt: input.after.fileId } },
            ],
          }),
    },
    orderBy: [{ deletedAt: "asc" }, { fileId: "asc" }],
    take: input.take,
  });
  return rows.map(toExpiredRoot);
};
