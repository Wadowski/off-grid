// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { CrossEntityLinkRecord, LinkEndpoint } from "../../types.js";
import { toCrossEntityLinkRecord } from "./to-cross-entity-link-record.js";

export const findCrossEntityLinksOf = async (
  tx: ModuleTransaction,
  endpoint: LinkEndpoint,
): Promise<CrossEntityLinkRecord[]> => {
  const rows = await tx.relationsCrossEntityLink.findMany({
    where: {
      OR: [
        { sourceType: endpoint.entityType, sourceId: endpoint.entityId },
        { targetType: endpoint.entityType, targetId: endpoint.entityId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toCrossEntityLinkRecord);
};
