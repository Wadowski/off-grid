// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { linkableEntityTypeSchema } from "@offgrid/contracts";
import type { ModuleTransaction } from "@offgrid/db";
import type { LinkEndpoint } from "../../types.js";

export const findVisibleLinkableTitles = async (
  tx: ModuleTransaction,
  endpoints: readonly LinkEndpoint[],
): Promise<Array<LinkEndpoint & { readonly title: string }>> => {
  if (endpoints.length === 0) {
    return [];
  }
  const rows = await tx.relationsLinkableEntity.findMany({
    where: {
      isRemoved: false,
      OR: endpoints.map((endpoint) => ({
        entityType: endpoint.entityType,
        entityId: endpoint.entityId,
      })),
    },
    select: { entityType: true, entityId: true, title: true },
  });
  return rows.map((row) => ({
    entityType: linkableEntityTypeSchema.parse(row.entityType),
    entityId: row.entityId,
    title: row.title,
  }));
};
