// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { InvitationPreview } from "../../types.js";
import { listAccountNames } from "../account-names/list-account-names.js";

export const findInvitationPreview = async (
  tx: ModuleTransaction,
  codeHash: string,
): Promise<InvitationPreview | null> => {
  const invitation = await tx.familyInvitation.findFirst({
    where: { codeHash, usedAt: null, revokedAt: null },
    select: {
      familyId: true,
      createdBy: true,
      family: { select: { name: true, createdAt: true } },
    },
  });
  if (invitation === null) {
    return null;
  }
  const names = await listAccountNames(tx, [invitation.createdBy]);
  return {
    familyId: invitation.familyId,
    familyName: invitation.family.name,
    familyCreatedAt: invitation.family.createdAt.toISOString(),
    invitedBy: { displayName: names.get(invitation.createdBy) ?? null },
  };
};
