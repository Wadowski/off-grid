// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { CrossEntityLinkRecord, LinkEndpoint } from "../../types.js";
import { toCrossEntityLinkRecord } from "./to-cross-entity-link-record.js";

export const findCrossEntityLinkByPair = async (
  tx: ModuleTransaction,
  source: LinkEndpoint,
  target: LinkEndpoint,
): Promise<CrossEntityLinkRecord | null> => {
  const row = await tx.relationsCrossEntityLink.findUnique({
    where: {
      sourceType_sourceId_targetType_targetId: {
        sourceType: source.entityType,
        sourceId: source.entityId,
        targetType: target.entityType,
        targetId: target.entityId,
      },
    },
  });
  return row === null ? null : toCrossEntityLinkRecord(row);
};
