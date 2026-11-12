// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withFamilyContext, type ModuleTransaction } from "@offgrid/db";
import { classifySourceVersion } from "@offgrid/event-bus";
import { MembershipChangeOutOfOrderError } from "../../application/errors/membership-change-out-of-order-error.js";
import type { MembershipChange } from "../../types.js";

export const applyFamilyMembership = async (
  tx: ModuleTransaction,
  change: MembershipChange,
): Promise<void> => {
  await withFamilyContext(tx, change.familyId);
  const key = { familyId_userId: { familyId: change.familyId, userId: change.userId } };
  const stored = await tx.calendarFamilyMembership.findUnique({ where: key });
  const outcome = classifySourceVersion(stored?.sourceVersion ?? null, change.sourceVersion);
  if (outcome === "duplicate" || outcome === "stale") {
    return;
  }
  if (outcome === "gap" && stored !== null) {
    throw new MembershipChangeOutOfOrderError();
  }
  const isMember = outcome === "apply" && change.isMember;
  await tx.calendarFamilyMembership.upsert({
    where: key,
    create: {
      familyId: change.familyId,
      userId: change.userId,
      sourceVersion: change.sourceVersion,
      isMember,
    },
    update: { sourceVersion: change.sourceVersion, isMember },
  });
};
