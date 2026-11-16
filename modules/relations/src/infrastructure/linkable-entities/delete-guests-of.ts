// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { LinkEndpoint } from "../../types.js";

export const deleteGuestsOf = async (
  tx: ModuleTransaction,
  endpoint: LinkEndpoint,
): Promise<void> => {
  await tx.relationsLinkableEntityGuest.deleteMany({
    where: { entityType: endpoint.entityType, entityId: endpoint.entityId },
  });
};
