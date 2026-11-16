// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { LinkEndpoint, StoredLinkableEntity } from "../../types.js";

export const findStoredLinkableEntity = async (
  tx: ModuleTransaction,
  endpoint: LinkEndpoint,
): Promise<StoredLinkableEntity | null> =>
  tx.relationsLinkableEntity.findUnique({
    where: {
      entityType_entityId: { entityType: endpoint.entityType, entityId: endpoint.entityId },
    },
    select: { sourceVersion: true, isRemoved: true },
  });
