// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withInvitationCodeHashContext, withUserContext, type ModuleDatabase } from "@offgrid/db";
import { hashInvitationCode } from "../../infrastructure/invitations/hash-invitation-code.js";
import { findInvitationPreview } from "../../infrastructure/invitations/find-invitation-preview.js";
import { findMembership } from "../../infrastructure/find-membership.js";
import type { PreviewOutcome } from "../../types.js";
import { isAccountLockedOut } from "./is-account-locked-out.js";
import { recordInvalidRedemption } from "./record-invalid-redemption.js";

// Reads the family an invitation is for without consuming the code. A code
// that is unknown, spent, revoked or expired counts towards the attempt limit,
// as a failed redemption does. A person who is already a member gets the same
// generic answer but does not count, as redemption does.
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
  const lookup = await db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    await withInvitationCodeHashContext(tx, codeHash);
    const found = await findInvitationPreview(tx, codeHash, now);
    if (found === null) {
      return { outcome: "unknown" as const };
    }
    if ((await findMembership(tx, found.familyId, userId)) !== null) {
      return { outcome: "already-member" as const };
    }
    return { outcome: "found" as const, value: found };
  });
  if (lookup.outcome === "found") {
    return lookup;
  }
  if (lookup.outcome === "already-member") {
    return { outcome: "invalid" };
  }
  await recordInvalidRedemption(db, userId, now);
  return { outcome: "invalid" };
};
