// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { INVITATION_ATTEMPT_POLICY } from "../../constants.js";
import { hashInvitationCode } from "../../infrastructure/invitations/hash-invitation-code.js";
import { recordFailedRedemption } from "../../infrastructure/invitations/record-failed-redemption.js";
import type { RedeemOutcome } from "../../types.js";
import { isAccountLockedOut } from "./is-account-locked-out.js";
import { joinWithInvitation } from "./join-with-invitation.js";

export const redeemFamilyInvitation = async (
  db: ModuleDatabase,
  userId: string,
  code: string,
): Promise<RedeemOutcome> => {
  const now = new Date();
  if (await isAccountLockedOut(db, userId, now)) {
    return { outcome: "rate-limited" };
  }
  const joined = await db.$transaction((tx) =>
    joinWithInvitation(tx, userId, hashInvitationCode(code), now),
  );
  if (joined !== null) {
    return { outcome: "joined", value: joined };
  }
  await db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    await recordFailedRedemption(tx, userId, INVITATION_ATTEMPT_POLICY, now);
  });
  return { outcome: "invalid" };
};
