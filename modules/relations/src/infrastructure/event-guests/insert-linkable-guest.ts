// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { GuestInvitation } from "../../types.js";

export const insertLinkableGuest = async (
  tx: ModuleTransaction,
  invitation: GuestInvitation,
): Promise<void> => {
  await tx.relationsLinkableEntityGuest.createMany({
    data: [
      {
        entityType: invitation.endpoint.entityType,
        entityId: invitation.endpoint.entityId,
        userId: invitation.guestUserId,
        hostUserId: invitation.hostUserId,
      },
    ],
    skipDuplicates: true,
  });
};
