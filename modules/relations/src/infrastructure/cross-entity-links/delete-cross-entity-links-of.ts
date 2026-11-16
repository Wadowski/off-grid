// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { LinkEndpoint } from "../../types.js";

export const deleteCrossEntityLinksOf = async (
  tx: ModuleTransaction,
  endpoint: LinkEndpoint,
): Promise<void> => {
  await tx.relationsCrossEntityLink.deleteMany({
    where: {
      OR: [
        { sourceType: endpoint.entityType, sourceId: endpoint.entityId },
        { targetType: endpoint.entityType, targetId: endpoint.entityId },
      ],
    },
  });
};
