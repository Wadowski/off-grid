// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { LinkableEntityVersion } from "../../types.js";

export const markLinkableEntityRemoved = async (
  tx: ModuleTransaction,
  change: LinkableEntityVersion,
): Promise<void> => {
  await tx.relationsLinkableEntity.updateMany({
    where: { entityType: change.endpoint.entityType, entityId: change.endpoint.entityId },
    data: { isRemoved: true, sourceVersion: change.sourceVersion },
  });
};
