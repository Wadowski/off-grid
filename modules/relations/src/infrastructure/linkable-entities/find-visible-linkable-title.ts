// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { LinkEndpoint } from "../../types.js";

export const findVisibleLinkableTitle = async (
  tx: ModuleTransaction,
  endpoint: LinkEndpoint,
): Promise<string | null> => {
  const row = await tx.relationsLinkableEntity.findFirst({
    where: { entityType: endpoint.entityType, entityId: endpoint.entityId, isRemoved: false },
    select: { title: true },
  });
  return row?.title ?? null;
};
