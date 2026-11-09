// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyMemberAddedV1 } from "@offgrid/contracts";
import {
  withFamilyContext,
  withInvitationCodeHashContext,
  withUserContext,
  type ModuleTransaction,
} from "@offgrid/db";
import { publishFamilyEvent } from "../../events/publish-family-event.js";
import { findMembership } from "../../infrastructure/find-membership.js";
import { insertMembership } from "../../infrastructure/insert-membership.js";
import { clearInvitationAttempts } from "../../infrastructure/invitations/clear-invitation-attempts.js";
import { consumeInvitation } from "../../infrastructure/invitations/consume-invitation.js";
import { findRedeemableInvitation } from "../../infrastructure/invitations/find-redeemable-invitation.js";
import type { JoinOutcome } from "../../types.js";

export const joinWithInvitation = async (
  tx: ModuleTransaction,
  userId: string,
  codeHash: string,
  now: Date,
): Promise<JoinOutcome> => {
  await withUserContext(tx, userId);
  await withInvitationCodeHashContext(tx, codeHash);
  const invitation = await findRedeemableInvitation(tx, codeHash);
  if (invitation === null) {
    return { outcome: "invalid" };
  }
  if ((await findMembership(tx, invitation.familyId, userId)) !== null) {
    return { outcome: "already-member" };
  }
  if (!(await consumeInvitation(tx, codeHash, userId, now))) {
    return { outcome: "invalid" };
  }
  await withFamilyContext(tx, invitation.familyId);
  await insertMembership(tx, invitation.familyId, userId, "member");
  await publishFamilyEvent(tx, familyMemberAddedV1, invitation.familyId, {
    userId,
    role: "member",
  });
  await clearInvitationAttempts(tx, userId);
  return { outcome: "joined", value: { familyId: invitation.familyId } };
};
