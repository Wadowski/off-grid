// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { hashInvitationCode } from "../../infrastructure/invitations/hash-invitation-code.js";
import type { RedeemOutcome } from "../../types.js";
import { isAccountLockedOut } from "./is-account-locked-out.js";
import { joinWithInvitation } from "./join-with-invitation.js";
import { recordInvalidRedemption } from "./record-invalid-redemption.js";

export const redeemFamilyInvitation = async (
  db: ModuleDatabase,
  userId: string,
  code: string,
): Promise<RedeemOutcome> => {
  const now = new Date();
  if (await isAccountLockedOut(db, userId, now)) {
    return { outcome: "rate-limited" };
  }
  const join = await db.$transaction((tx) =>
    joinWithInvitation(tx, userId, hashInvitationCode(code), now),
  );
  if (join.outcome === "joined") {
    return join;
  }
  if (join.outcome === "already-member") {
    return { outcome: "invalid" };
  }
  await recordInvalidRedemption(db, userId, now);
  return { outcome: "invalid" };
};
