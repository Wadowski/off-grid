// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withFamilyContext, withUserContext, type ModuleTransaction } from "@offgrid/db";
import { findMembership } from "../../infrastructure/find-membership.js";
import { insertMembership } from "../../infrastructure/insert-membership.js";
import { clearInvitationAttempts } from "../../infrastructure/invitations/clear-invitation-attempts.js";
import { consumeInvitation } from "../../infrastructure/invitations/consume-invitation.js";
import { findRedeemableInvitation } from "../../infrastructure/invitations/find-redeemable-invitation.js";
import { withInvitationCodeContext } from "../../infrastructure/invitations/with-invitation-code-context.js";
import type { JoinedFamily } from "../../types.js";

export const joinWithInvitation = async (
  tx: ModuleTransaction,
  userId: string,
  codeHash: string,
  now: Date,
): Promise<JoinedFamily | null> => {
  await withUserContext(tx, userId);
  await withInvitationCodeContext(tx, codeHash);
  const invitation = await findRedeemableInvitation(tx, codeHash);
  if (invitation === null) {
    return null;
  }
  if ((await findMembership(tx, invitation.familyId, userId)) !== null) {
    return null;
  }
  if (!(await consumeInvitation(tx, codeHash, userId, now))) {
    return null;
  }
  await withFamilyContext(tx, invitation.familyId);
  await insertMembership(tx, invitation.familyId, userId, "member");
  await clearInvitationAttempts(tx, userId);
  return { familyId: invitation.familyId };
};
