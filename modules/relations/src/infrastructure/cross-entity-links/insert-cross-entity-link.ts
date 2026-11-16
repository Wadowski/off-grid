// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { NewCrossEntityLink } from "../../types.js";

export const insertCrossEntityLink = async (
  tx: ModuleTransaction,
  link: NewCrossEntityLink,
): Promise<boolean> => {
  const result = await tx.relationsCrossEntityLink.createMany({
    data: [
      {
        linkId: link.linkId,
        sourceType: link.source.entityType,
        sourceId: link.source.entityId,
        targetType: link.target.entityType,
        targetId: link.target.entityId,
        familyId: link.owner.familyId,
        userId: link.owner.userId,
        createdBy: link.createdBy,
      },
    ],
    skipDuplicates: true,
  });
  return result.count === 1;
};
