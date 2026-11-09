// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { randomUUID } from "node:crypto";
import type { InsertedInvitation, NewInvitation } from "../../types.js";

export const insertInvitation = async (
  tx: ModuleTransaction,
  invitation: NewInvitation,
): Promise<InsertedInvitation> => {
  const invitationId = randomUUID();
  await tx.familyInvitation.create({
    data: {
      invitationId,
      familyId: invitation.familyId,
      codeHash: invitation.codeHash,
      createdBy: invitation.createdBy,
      createdAt: invitation.now,
      expiresAt: invitation.expiresAt,
    },
  });
  return { invitationId, expiresAt: invitation.expiresAt };
};
