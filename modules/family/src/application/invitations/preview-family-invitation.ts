// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withInvitationCodeHashContext, withUserContext, type ModuleDatabase } from "@offgrid/db";
import { INVITATION_ATTEMPT_POLICY } from "../../constants.js";
import { hashInvitationCode } from "../../infrastructure/invitations/hash-invitation-code.js";
import { findInvitationPreview } from "../../infrastructure/invitations/find-invitation-preview.js";
import { recordFailedRedemption } from "../../infrastructure/invitations/record-failed-redemption.js";
import { findMembership } from "../../infrastructure/find-membership.js";
import type { PreviewOutcome } from "../../types.js";
import { isAccountLockedOut } from "./is-account-locked-out.js";

// Reads the family an invitation is for without consuming the code. A failed
// lookup counts towards the same attempt limit as redemption.
export const previewFamilyInvitation = async (
  db: ModuleDatabase,
  userId: string,
  code: string,
): Promise<PreviewOutcome> => {
  const now = new Date();
  if (await isAccountLockedOut(db, userId, now)) {
    return { outcome: "rate-limited" };
  }
  const codeHash = hashInvitationCode(code);
  const preview = await db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    await withInvitationCodeHashContext(tx, codeHash);
    const found = await findInvitationPreview(tx, codeHash);
    if (found === null || (await findMembership(tx, found.familyId, userId)) !== null) {
      return null;
    }
    return found;
  });
  if (preview !== null) {
    return { outcome: "found", value: preview };
  }
  await db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    await recordFailedRedemption(tx, userId, INVITATION_ATTEMPT_POLICY, now);
  });
  return { outcome: "invalid" };
};
