// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { LinkableEntityUpsert } from "../../types.js";

export const upsertLinkableEntity = async (
  tx: ModuleTransaction,
  change: LinkableEntityUpsert,
): Promise<void> => {
  const key = {
    entityType_entityId: {
      entityType: change.endpoint.entityType,
      entityId: change.endpoint.entityId,
    },
  };
  await tx.relationsLinkableEntity.upsert({
    where: key,
    create: {
      entityType: change.endpoint.entityType,
      entityId: change.endpoint.entityId,
      familyId: change.owner.familyId,
      userId: change.owner.userId,
      title: change.title,
      sourceVersion: change.sourceVersion,
    },
    update: { title: change.title, sourceVersion: change.sourceVersion, isRemoved: false },
  });
};
